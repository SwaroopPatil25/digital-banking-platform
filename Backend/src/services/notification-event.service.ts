import Notification, { NotificationType, NotificationPriority } from "../models/notification.model.js";

interface TriggerNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
}

export const triggerNotification = async (params: TriggerNotificationParams): Promise<void> => {
  try {
    await Notification.create({
      userId: params.userId,
      title: params.title,
      message: params.message,
      type: params.type,
      priority: params.priority || "MEDIUM",
    });
  } catch (error: any) {
    console.error("Notification trigger failed (non-blocking):", error.message);
  }
};

// Pre-built notification triggers
export const notifyTransferSuccess = (userId: string, amount: number, beneficiaryName: string) =>
  triggerNotification({
    userId,
    type: "TRANSACTION",
    title: "Transfer Successful",
    message: `₹${amount.toLocaleString("en-IN")} transferred successfully to ${beneficiaryName}`,
    priority: "MEDIUM",
  });

export const notifyTransferFailed = (userId: string, amount: number, beneficiaryName: string, reason: string) =>
  triggerNotification({
    userId,
    type: "TRANSACTION",
    title: "Transfer Failed",
    message: `Transfer of ₹${amount.toLocaleString("en-IN")} to ${beneficiaryName} failed: ${reason}`,
    priority: "HIGH",
  });

export const notifyBillPayment = (userId: string, amount: number, billerName: string) =>
  triggerNotification({
    userId,
    type: "TRANSACTION",
    title: "Bill Payment Successful",
    message: `Bill of ₹${amount.toLocaleString("en-IN")} paid successfully to ${billerName}`,
    priority: "MEDIUM",
  });

export const notifyBeneficiaryAdded = (userId: string, beneficiaryName: string) =>
  triggerNotification({
    userId,
    type: "ALERT",
    title: "Beneficiary Added",
    message: `${beneficiaryName} added as beneficiary. Active after 30-minute cooling period.`,
    priority: "LOW",
  });

export const notifyLargeTransaction = (userId: string, amount: number) =>
  triggerNotification({
    userId,
    type: "SECURITY",
    title: "Large Transaction Alert",
    message: `A high-value transaction of ₹${amount.toLocaleString("en-IN")} was flagged for review.`,
    priority: "HIGH",
  });

export const notifySuspiciousActivity = (userId: string) =>
  triggerNotification({
    userId,
    type: "FRAUD",
    title: "Suspicious Activity Detected",
    message: "Multiple rapid transfers detected. Your account has been flagged for review.",
    priority: "CRITICAL",
  });

export const notifyBeneficiaryActivated = (userId: string, beneficiaryName: string) =>
  triggerNotification({
    userId,
    type: "ALERT",
    title: "Beneficiary Activated",
    message: `${beneficiaryName} is now active and available for transfers.`,
    priority: "LOW",
  });
