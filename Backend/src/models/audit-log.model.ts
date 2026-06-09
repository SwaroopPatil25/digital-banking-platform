import mongoose, { Schema, Document } from "mongoose";

export type AuditAction =
  | "LOGIN"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "SESSION_EXPIRED"
  | "TRANSFER_INITIATED"
  | "TRANSFER_SUCCESS"
  | "TRANSFER_FAILED"
  | "TRANSFER_REVERSED"
  | "BILL_PAYMENT"
  | "BILL_PAYMENT_FAILED"
  | "BENEFICIARY_ADDED"
  | "BENEFICIARY_REMOVED"
  | "BENEFICIARY_UPDATED"
  | "PROFILE_UPDATED"
  | "KYC_UPDATED"
  | "STATEMENT_DOWNLOAD"
  | "NOTIFICATION_READ"
  | "NOTIFICATION_READ_ALL"
  | "PASSWORD_CHANGED"
  | "FRAUD_DETECTED"
  | "RATE_LIMIT_EXCEEDED";

export type AuditModule =
  | "AUTH"
  | "TRANSFER"
  | "PAY_BILLS"
  | "BENEFICIARY"
  | "PROFILE"
  | "NOTIFICATIONS"
  | "STATEMENT"
  | "SECURITY";

export type AuditStatus = "SUCCESS" | "FAILED" | "PENDING" | "WARNING";

export interface IAuditLog extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  module: string;
  description: string;
  status: string;
  entityId?: mongoose.Types.ObjectId;
  entityType?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    action: { type: String, required: true },
    module: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ["SUCCESS", "FAILED", "PENDING", "WARNING"], required: true },
    entityId: { type: Schema.Types.ObjectId },
    entityType: { type: String },
    metadata: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
    deviceInfo: { type: String },
  },
  { timestamps: true }
);

auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1, action: 1 });
auditLogSchema.index({ userId: 1, module: 1 });
auditLogSchema.index({ status: 1 });

export default mongoose.model<IAuditLog>("AuditLog", auditLogSchema);
