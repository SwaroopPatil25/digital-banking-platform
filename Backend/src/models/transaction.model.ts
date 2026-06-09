import mongoose, { Schema, Document } from "mongoose";

export type TransactionType = "CREDIT" | "DEBIT";
export type TransactionCategory = "TRANSFER" | "BILL_PAYMENT" | "ACCOUNT_CREDIT" | "ACCOUNT_DEBIT";
export type TransactionStatus = "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED" | "REVERSED";

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  accountId: mongoose.Types.ObjectId;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  status: TransactionStatus;
  referenceNumber: string;
  balanceAfterTransaction?: number;
  remarks?: string;
  transactionDate: Date;
  // Transfer-specific
  beneficiaryId?: mongoose.Types.ObjectId;
  beneficiaryName?: string;
  // Bill payment-specific
  billCategory?: string;
  billerName?: string;
  // Phase 3: Lifecycle fields
  statusUpdatedAt?: Date;
  failureReason?: string;
  processingStartedAt?: Date;
  completedAt?: Date;
  reversedAt?: Date;
  reversalReason?: string;
  riskFlag?: "NORMAL" | "HIGH_RISK" | "SUSPICIOUS";
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: [true, "User ID is required"] },
    accountId: { type: Schema.Types.ObjectId, ref: "Account", required: [true, "Account ID is required"] },
    type: { type: String, enum: ["CREDIT", "DEBIT"], required: [true, "Transaction type is required"] },
    category: { type: String, enum: ["TRANSFER", "BILL_PAYMENT", "ACCOUNT_CREDIT", "ACCOUNT_DEBIT"], required: [true, "Transaction category is required"] },
    amount: { type: Number, required: [true, "Transaction amount is required"] },
    description: { type: String, required: [true, "Transaction description is required"] },
    status: { type: String, enum: ["PENDING", "PROCESSING", "SUCCESS", "FAILED", "REVERSED"], required: [true, "Transaction status is required"] },
    referenceNumber: { type: String, required: [true, "Reference number is required"], unique: true },
    balanceAfterTransaction: { type: Number },
    remarks: { type: String },
    transactionDate: { type: Date, required: [true, "Transaction date is required"] },
    // Transfer-specific
    beneficiaryId: { type: Schema.Types.ObjectId, ref: "Beneficiary" },
    beneficiaryName: { type: String },
    // Bill payment-specific
    billCategory: { type: String },
    billerName: { type: String },
    // Phase 3: Lifecycle
    statusUpdatedAt: { type: Date },
    failureReason: { type: String },
    processingStartedAt: { type: Date },
    completedAt: { type: Date },
    reversedAt: { type: Date },
    reversalReason: { type: String },
    riskFlag: { type: String, enum: ["NORMAL", "HIGH_RISK", "SUSPICIOUS"], default: "NORMAL" },
  },
  { timestamps: true }
);

// Compound indexes for search/filter/pagination performance
transactionSchema.index({ userId: 1, transactionDate: -1 });
transactionSchema.index({ userId: 1, status: 1 });
transactionSchema.index({ userId: 1, category: 1 });
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ userId: 1, riskFlag: 1 });

export default mongoose.model<ITransaction>("Transaction", transactionSchema);
