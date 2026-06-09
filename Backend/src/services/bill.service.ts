import Account from "../models/account.model.js";
import Transaction from "../models/transaction.model.js";
import BillPayment, { BILL_CATEGORIES } from "../models/bill-payment.model.js";
import {
  createLifecycleTransaction,
  transitionToProcessing,
  transitionToSuccess,
  transitionToFailed,
  createTransaction,
} from "../utils/transaction.helper.js";
import { BankingError, ErrorCodes, createBankingError } from "../utils/errors.js";
import { checkTransferLimits, updateDailyLimits, assessRisk } from "./fraud.service.js";
import { notifyBillPayment } from "./notification-event.service.js";
import { auditBillPayment } from "./audit.service.js";
import { buildPaginationResult, getSkip } from "../utils/pagination.js";
import { PayBillInput } from "../validations/bill.validation.js";

interface BillHistoryQuery {
  page: number;
  limit: number;
  category?: string;
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  electricity: "Electricity",
  mobile: "Mobile Recharge",
  dth: "DTH",
  broadband: "Broadband",
  water: "Water",
  gas: "Gas",
  creditCard: "Credit Card",
  loanEmi: "Loan EMI",
};

export const getCategories = () => {
  const categories = BILL_CATEGORIES.map((value) => ({
    label: CATEGORY_LABELS[value],
    value,
  }));
  return { success: true, categories };
};

export const payBill = async (userId: string, data: PayBillInput) => {
  const account = await Account.findOne({ userId });
  if (!account) {
    throw createBankingError(ErrorCodes.INVALID_ACCOUNT);
  }

  const categoryLabel = CATEGORY_LABELS[data.category] || data.category;

  // Fraud/risk checks
  await checkTransferLimits(userId, data.amount);
  const riskFlag = await assessRisk(userId, data.amount);

  // Validate balance
  if (account.balance < data.amount) {
    await createTransaction({
      userId,
      accountId: account._id,
      type: "DEBIT",
      category: "BILL_PAYMENT",
      amount: data.amount,
      description: `${categoryLabel} Bill Payment failed - ${data.billerName} - Insufficient balance`,
      status: "FAILED",
      balanceAfterTransaction: account.balance,
      billCategory: data.category,
      billerName: data.billerName,
      failureReason: "Insufficient balance",
      riskFlag,
    });
    throw createBankingError(ErrorCodes.INSUFFICIENT_BALANCE);
  }

  // Create PENDING transaction (lifecycle)
  const transaction = await createLifecycleTransaction({
    userId,
    accountId: account._id,
    type: "DEBIT",
    category: "BILL_PAYMENT",
    amount: data.amount,
    description: `${categoryLabel} Bill Payment - ${data.billerName}`,
    status: "PENDING",
    balanceAfterTransaction: account.balance,
    billCategory: data.category,
    billerName: data.billerName,
    riskFlag,
  });

  // Transition to PROCESSING
  await transitionToProcessing(transaction._id);

  // Deduct balance
  const previousBalance = account.balance;
  account.balance -= data.amount;

  try {
    await account.save();
  } catch (error: any) {
    await transitionToFailed(transaction._id, "Account update error");
    throw createBankingError(ErrorCodes.BILL_PAYMENT_FAILED);
  }

  // Transition to SUCCESS
  await transitionToSuccess(transaction._id, account.balance);

  // Create bill payment record
  const now = new Date();
  const billPayment = await BillPayment.create({
    userId,
    category: data.category,
    billerName: data.billerName,
    consumerNumber: data.consumerNumber,
    amount: data.amount,
    status: "SUCCESS",
    paymentDate: now,
    paidAt: now,
    transactionId: transaction._id,
  });

  // Update daily limits
  await updateDailyLimits(userId, data.amount);

  // Non-blocking audit + notification
  auditBillPayment(userId, String(billPayment._id), data.amount, data.billerName);
  notifyBillPayment(userId, data.amount, data.billerName);

  return {
    success: true,
    message: "Bill payment successful",
    data: {
      updatedBalance: account.balance,
      transactionId: transaction._id,
      referenceNumber: transaction.referenceNumber,
      billPaymentId: billPayment._id,
      riskFlag,
    },
  };
};

export const getPaymentHistory = async (userId: string, query: BillHistoryQuery) => {
  const { page, limit, category, status, search, startDate, endDate, minAmount, maxAmount } = query;

  const filter: Record<string, any> = { userId };

  if (category) filter.category = category;
  if (status) filter.status = status;

  if (search) {
    filter.billerName = { $regex: search, $options: "i" };
  }

  if (startDate || endDate) {
    filter.paidAt = {};
    if (startDate) filter.paidAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.paidAt.$lte = end;
    }
  }

  if (minAmount !== undefined || maxAmount !== undefined) {
    filter.amount = {};
    if (minAmount !== undefined) filter.amount.$gte = minAmount;
    if (maxAmount !== undefined) filter.amount.$lte = maxAmount;
  }

  const skip = getSkip(page, limit);

  const [payments, totalRecords] = await Promise.all([
    BillPayment.find(filter)
      .sort({ paidAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("category billerName consumerNumber amount paymentDate paidAt status"),
    BillPayment.countDocuments(filter),
  ]);

  const filtersApplied: Record<string, any> = {};
  if (category) filtersApplied.category = category;
  if (status) filtersApplied.status = status;
  if (search) filtersApplied.search = search;
  if (startDate) filtersApplied.startDate = startDate;
  if (endDate) filtersApplied.endDate = endDate;

  return {
    success: true,
    data: payments,
    pagination: buildPaginationResult(page, limit, totalRecords),
    filtersApplied,
  };
};
