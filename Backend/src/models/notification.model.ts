import mongoose, { Schema, Document } from "mongoose";

export type NotificationType = "TRANSACTION" | "ALERT" | "PROMOTION" | "SYSTEM" | "SECURITY" | "FRAUD";
export type NotificationPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  readAt?: Date;
  // Soft delete
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: [true, "User ID is required"] },
    title: { type: String, required: [true, "Notification title is required"] },
    message: { type: String, required: [true, "Notification message is required"] },
    type: { type: String, enum: ["TRANSACTION", "ALERT", "PROMOTION", "SYSTEM", "SECURITY", "FRAUD"], required: [true, "Notification type is required"] },
    priority: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"], default: "MEDIUM" },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    // Soft delete
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Compound indexes for search/filter/pagination performance
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1 });
notificationSchema.index({ userId: 1, isDeleted: 1 });

export default mongoose.model<INotification>("Notification", notificationSchema);
