import Account from "../models/account.model.js";
import Beneficiary from "../models/beneficiary.model.js";
import Transaction from "../models/transaction.model.js";
import {
  createLifecycleTransaction,
  transitionToProcessing,
  transitionToSuccess,
  transitionToFailed,
  createTransaction,
} from "../utils/transaction.helper.js";
import { BankingError, ErrorCodes, createBankingError } from "../utils/errors.js";
import { checkTransferLimits, updateDailyLimits, assessRisk, checkBeneficiaryCoolingPeriod } from "./fraud.service.js";
import { notifyTransferSuccess, notifyTransferFailed } from "./notification-event.service.js";
import { auditTransferInitiated, auditTransferSuccess, auditTransferFailed } from "./audit.service.js";
import { TransferInput } from "../validations/transfer.validation.js";

export const transferMoney = async (userId: string, data: TransferInput) => {
  // STEP 1: Validate beneficiary
  const beneficiary = await Beneficiary.findOne({ _id: data.beneficiaryId, userId, isDeleted: { $ne: true } });
  if (!beneficiary) {
    throw createBankingError(ErrorCodes.BENEFICIARY_NOT_FOUND);
  }

  // STEP 2: Check beneficiary status (cooling period)
  if (beneficiary.beneficiaryStatus === "BLOCKED") {
    throw createBankingError(ErrorCodes.BENEFICIARY_BLOCKED);
  }
  if (beneficiary.beneficiaryStatus === "PENDING_APPROVAL") {
    const cooled = checkBeneficiaryCoolingPeriod(beneficiary.activatedAt, beneficiary.createdAt);
    if (!cooled) {
      throw createBankingError(ErrorCodes.BENEFICIARY_PENDING);
    }
    // Auto-activate after cooling period
    beneficiary.beneficiaryStatus = "ACTIVE";
    beneficiary.activatedAt = new Date();
    await beneficiary.save();
  }

  // STEP 3: Validate sender account
  const account = await Account.findOne({ userId });
  if (!account) {
    throw createBankingError(ErrorCodes.INVALID_ACCOUNT);
  }

  // STEP 4: Fraud/risk checks
  await checkTransferLimits(userId, data.amount);

  // STEP 5: Assess risk level
  const riskFlag = await assessRisk(userId, data.amount);

  // STEP 6: Validate balance
  if (account.balance < data.amount) {
    await createTransaction({
      userId,
      accountId: account._id,
      type: "DEBIT",
      category: "TRANSFER",
      amount: data.amount,
      description: `Transfer failed to ${beneficiary.beneficiaryName} - Insufficient balance`,
      status: "FAILED",
      balanceAfterTransaction: account.balance,
      remarks: data.remarks,
      beneficiaryId: beneficiary._id,
      beneficiaryName: beneficiary.beneficiaryName,
      failureReason: "Insufficient balance",
      riskFlag,
    });
    throw createBankingError(ErrorCodes.INSUFFICIENT_BALANCE);
  }

  // STEP 7: Create transaction in PENDING state (lifecycle)
  const transaction = await createLifecycleTransaction({
    userId,
    accountId: account._id,
    type: "DEBIT",
    category: "TRANSFER",
    amount: data.amount,
    description: `Transferred to ${beneficiary.beneficiaryName}`,
    status: "PENDING",
    balanceAfterTransaction: account.balance,
    remarks: data.remarks,
    beneficiaryId: beneficiary._id,
    beneficiaryName: beneficiary.beneficiaryName,
    riskFlag,
  });

  // STEP 8: Transition to PROCESSING
  await transitionToProcessing(transaction._id);

  // STEP 9: Deduct balance
  const previousBalance = account.balance;
  account.balance -= data.amount;

  try {
    await account.save();
  } catch (error: any) {
    await transitionToFailed(transaction._id, "Account update error");
    await notifyTransferFailed(userId, data.amount, beneficiary.beneficiaryName, "Account update error");
    throw createBankingError(ErrorCodes.TRANSFER_FAILED);
  }

  // STEP 10: Transition to SUCCESS
  await transitionToSuccess(transaction._id, account.balance);

  // STEP 11: Update daily limits
  await updateDailyLimits(userId, data.amount);

  // STEP 12: Non-blocking audit + notification
  auditTransferSuccess(userId, String(transaction._id), data.amount, beneficiary.beneficiaryName);
  notifyTransferSuccess(userId, data.amount, beneficiary.beneficiaryName);

  return {
    success: true,
    message: "Transfer successful",
    data: {
      updatedBalance: account.balance,
      transactionId: transaction._id,
      referenceNumber: transaction.referenceNumber,
      riskFlag,
    },
  };
};
