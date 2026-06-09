import mongoose, { Schema, Document } from "mongoose";

export interface IAccount extends Document {
  userId: mongoose.Types.ObjectId;
  accountNumber: string;
  accountType: "savings" | "current" | "salary";
  balance: number;
  creditScore: number;
  rewardPoints: number;
  status: string;
  branch: string;
  ifscCode: string;
  kycStatus: "Pending" | "Verified" | "Rejected";
  createdAt: Date;
  updatedAt: Date;
}

const accountSchema = new Schema<IAccount>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: [true, "User ID is required"], index: true },
    accountNumber: { type: String, required: [true, "Account number is required"], unique: true },
    accountType: { type: String, enum: ["savings", "current", "salary"], required: [true, "Account type is required"] },
    balance: { type: Number, required: [true, "Available balance is required"] },
    creditScore: { type: Number, required: [true, "Credit score is required"] },
    rewardPoints: { type: Number, required: [true, "Reward points is required"] },
    status: { type: String, default: "Active" },
    branch: { type: String, required: [true, "Branch is required"] },
    ifscCode: { type: String, required: [true, "IFSC code is required"] },
    kycStatus: { type: String, enum: ["Pending", "Verified", "Rejected"], required: [true, "KYC status is required"] },
  },
  { timestamps: true }
);

export default mongoose.model<IAccount>("Account", accountSchema);
