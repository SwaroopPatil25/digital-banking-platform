import mongoose, { Schema, Document } from "mongoose";

export interface IStatement extends Document {
  userId: mongoose.Types.ObjectId;
  statementId: string;
  fromDate: Date;
  toDate: Date;
  format: "pdf" | "csv";
  transactionCount: number;
  generatedAt: Date;
  downloadCount: number;
  fileName: string;
  status: "GENERATED" | "FAILED";
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
}

const statementSchema = new Schema<IStatement>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    statementId: { type: String, required: true, unique: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    format: { type: String, enum: ["pdf", "csv"], required: true },
    transactionCount: { type: Number, default: 0 },
    generatedAt: { type: Date, default: Date.now },
    downloadCount: { type: Number, default: 0 },
    fileName: { type: String, required: true },
    status: { type: String, enum: ["GENERATED", "FAILED"], default: "GENERATED" },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

statementSchema.index({ userId: 1, generatedAt: -1 });
statementSchema.index({ statementId: 1 });

export default mongoose.model<IStatement>("Statement", statementSchema);
