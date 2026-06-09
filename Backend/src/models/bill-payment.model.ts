import mongoose, { Schema, Document } from "mongoose";

export const BILL_CATEGORIES = [
  "electricity",
  "mobile",
  "dth",
  "broadband",
  "water",
  "gas",
  "creditCard",
  "loanEmi",
] as const;

export type BillCategory = (typeof BILL_CATEGORIES)[number];

export interface IBillPayment extends Document {
  userId: mongoose.Types.ObjectId;
  category: BillCategory;
  billerName: string;
  consumerNumber: string;
  amount: number;
  status: string;
  paymentDate: Date;
  paidAt: Date;
  transactionId: mongoose.Types.ObjectId;
  autoPay: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const billPaymentSchema = new Schema<IBillPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: [true, "User ID is required"] },
    category: { type: String, enum: BILL_CATEGORIES, required: [true, "Bill category is required"] },
    billerName: { type: String, required: [true, "Biller name is required"] },
    consumerNumber: { type: String, required: [true, "Consumer number is required"] },
    amount: { type: Number, required: [true, "Bill amount is required"] },
    status: { type: String, required: [true, "Bill payment status is required"] },
    paymentDate: { type: Date, required: [true, "Payment date is required"] },
    paidAt: { type: Date, required: [true, "Paid date is required"] },
    transactionId: { type: Schema.Types.ObjectId, ref: "Transaction", required: [true, "Transaction ID is required"] },
    autoPay: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Compound indexes for search/filter/pagination performance
billPaymentSchema.index({ userId: 1, paymentDate: -1 });
billPaymentSchema.index({ userId: 1, category: 1 });
billPaymentSchema.index({ userId: 1, status: 1 });

export default mongoose.model<IBillPayment>("BillPayment", billPaymentSchema);
