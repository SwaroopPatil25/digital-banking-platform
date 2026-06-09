export interface Notification {
  _id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  category?: "transaction" | "fraud" | "kyc" | "system" | "transfer" | "large_transfer" | "security";
  priority?: "high" | "medium" | "low";
}

export interface NotificationResponse {
  success: boolean;
  notifications: Notification[];
  unreadCount: number;
}
