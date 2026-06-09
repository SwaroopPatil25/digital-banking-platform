import mongoose, { Schema, Document } from "mongoose";

export type BeneficiaryStatus = "PENDING_APPROVAL" | "ACTIVE" | "BLOCKED";

export interface IBeneficiary extends Document {
  userId: mongoose.Types.ObjectId;
  beneficiaryName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  nickname?: string;
  status: string;
  beneficiaryStatus: BeneficiaryStatus;
  activatedAt?: Date;
  isFavorite: boolean;
  // Soft delete
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const beneficiarySchema = new Schema<IBeneficiary>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: [true, "User ID is required"] },
    beneficiaryName: { type: String, required: [true, "Beneficiary name is required"] },
    accountNumber: { type: String, required: [true, "Account number is required"] },
    bankName: { type: String, required: [true, "Bank name is required"] },
    ifscCode: { type: String, required: [true, "IFSC code is required"] },
    nickname: { type: String },
    status: { type: String, required: [true, "Beneficiary status is required"] },
    beneficiaryStatus: { type: String, enum: ["PENDING_APPROVAL", "ACTIVE", "BLOCKED"], default: "PENDING_APPROVAL" },
    activatedAt: { type: Date },
    isFavorite: { type: Boolean, default: false },
    // Soft delete
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Compound indexes for search/filter/pagination performance
beneficiarySchema.index({ userId: 1, beneficiaryName: 1 });
beneficiarySchema.index({ userId: 1, bankName: 1 });
beneficiarySchema.index({ userId: 1, isFavorite: 1 });
beneficiarySchema.index({ userId: 1, isDeleted: 1 });
beneficiarySchema.index({ userId: 1, beneficiaryStatus: 1 });

export default mongoose.model<IBeneficiary>("Beneficiary", beneficiarySchema);
