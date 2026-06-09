import mongoose from "mongoose";
import Transaction, { TransactionType, TransactionCategory, TransactionStatus } from "../models/transaction.model.js";

export const generateTransactionReference = (): string => {
  const now = new Date();
  const dateStr = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");
  const timeStr = String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0");
  const random = Math.floor(1000 + Math.random() * 9000).toString();
  return `TXN${dateStr}${timeStr}${random}`;
};

interface CreateTransactionParams {
  userId: string | mongoose.Types.ObjectId;
  accountId: mongoose.Types.ObjectId;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  status: TransactionStatus;
  balanceAfterTransaction?: number;
  remarks?: string;
  beneficiaryId?: mongoose.Types.ObjectId;
  beneficiaryName?: string;
  billCategory?: string;
  billerName?: string;
  failureReason?: string;
  riskFlag?: "NORMAL" | "HIGH_RISK" | "SUSPICIOUS";
}

export const createTransaction = async (params: CreateTransactionParams) => {
  const referenceNumber = generateTransactionReference();
  const now = new Date();

  const transactionData: any = {
    userId: params.userId,
    accountId: params.accountId,
    type: params.type,
    category: params.category,
    amount: params.amount,
    description: params.description,
    status: params.status,
    referenceNumber,
    balanceAfterTransaction: params.balanceAfterTransaction,
    remarks: params.remarks,
    transactionDate: now,
    beneficiaryId: params.beneficiaryId,
    beneficiaryName: params.beneficiaryName,
    billCategory: params.billCategory,
    billerName: params.billerName,
    statusUpdatedAt: now,
    riskFlag: params.riskFlag || "NORMAL",
  };

  // Set lifecycle timestamps based on status
  if (params.status === "FAILED") {
    transactionData.failureReason = params.failureReason || params.description;
  }
  if (params.status === "SUCCESS") {
    transactionData.processingStartedAt = now;
    transactionData.completedAt = now;
  }
  if (params.status === "PROCESSING") {
    transactionData.processingStartedAt = now;
  }

  return await Transaction.create(transactionData);
};

/**
 * Banking-grade transaction lifecycle:
 * Creates PENDING → transitions to PROCESSING → final state (SUCCESS/FAILED)
 */
export const createLifecycleTransaction = async (params: CreateTransactionParams) => {
  const referenceNumber = generateTransactionReference();
  const now = new Date();

  // Step 1: Create in PENDING
  const txn = await Transaction.create({
    userId: params.userId,
    accountId: params.accountId,
    type: params.type,
    category: params.category,
    amount: params.amount,
    description: params.description,
    status: "PENDING",
    referenceNumber,
    balanceAfterTransaction: params.balanceAfterTransaction,
    remarks: params.remarks,
    transactionDate: now,
    beneficiaryId: params.beneficiaryId,
    beneficiaryName: params.beneficiaryName,
    billCategory: params.billCategory,
    billerName: params.billerName,
    statusUpdatedAt: now,
    riskFlag: params.riskFlag || "NORMAL",
  });

  return txn;
};

export const transitionToProcessing = async (transactionId: mongoose.Types.ObjectId) => {
  const now = new Date();
  return await Transaction.findByIdAndUpdate(transactionId, {
    status: "PROCESSING",
    processingStartedAt: now,
    statusUpdatedAt: now,
  }, { new: true });
};

export const transitionToSuccess = async (transactionId: mongoose.Types.ObjectId, balanceAfter: number) => {
  const now = new Date();
  return await Transaction.findByIdAndUpdate(transactionId, {
    status: "SUCCESS",
    completedAt: now,
    statusUpdatedAt: now,
    balanceAfterTransaction: balanceAfter,
  }, { new: true });
};

export const transitionToFailed = async (transactionId: mongoose.Types.ObjectId, failureReason: string) => {
  const now = new Date();
  return await Transaction.findByIdAndUpdate(transactionId, {
    status: "FAILED",
    failureReason,
    statusUpdatedAt: now,
  }, { new: true });
};

export const transitionToReversed = async (transactionId: mongoose.Types.ObjectId, reversalReason: string) => {
  const now = new Date();
  return await Transaction.findByIdAndUpdate(transactionId, {
    status: "REVERSED",
    reversedAt: now,
    reversalReason,
    statusUpdatedAt: now,
  }, { new: true });
};
