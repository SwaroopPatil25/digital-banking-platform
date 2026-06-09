import Notification from "../models/notification.model.js";
import { buildPaginationResult, getSkip } from "../utils/pagination.js";
import { auditNotificationRead, auditNotificationReadAll } from "./audit.service.js";

interface NotificationQuery {
  page: number;
  limit: number;
  isRead?: string;
  type?: string;
}

export const getNotifications = async (userId: string, query: NotificationQuery) => {
  const { page, limit, isRead, type } = query;

  const filter: Record<string, any> = { userId, isDeleted: { $ne: true } };

  if (isRead === "true") filter.isRead = true;
  if (isRead === "false") filter.isRead = false;
  if (type) filter.type = type;

  const skip = getSkip(page, limit);

  const [notifications, totalRecords] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
  ]);

  const filtersApplied: Record<string, any> = {};
  if (isRead !== undefined) filtersApplied.isRead = isRead;
  if (type) filtersApplied.type = type;

  return {
    success: true,
    data: notifications,
    pagination: buildPaginationResult(page, limit, totalRecords),
    filtersApplied,
  };
};

export const getUnreadCount = async (userId: string) => {
  const count = await Notification.countDocuments({ userId, isRead: false, isDeleted: { $ne: true } });
  return { success: true, count };
};

export const markAsRead = async (userId: string, notificationId: string) => {
  const notification = await Notification.findOne({ _id: notificationId, userId, isDeleted: { $ne: true } });
  if (!notification) {
    throw new Error("Notification not found");
  }

  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();

  auditNotificationRead(userId, notificationId);

  return { success: true, message: "Notification marked as read" };
};

export const markAllAsRead = async (userId: string) => {
  await Notification.updateMany(
    { userId, isRead: false, isDeleted: { $ne: true } },
    { isRead: true, readAt: new Date() }
  );
  auditNotificationReadAll(userId);
  return { success: true, message: "All notifications marked as read" };
};

export const getLatestNotifications = async (userId: string) => {
  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ userId, isDeleted: { $ne: true } }).sort({ createdAt: -1 }).limit(5),
    Notification.countDocuments({ userId, isRead: false, isDeleted: { $ne: true } }),
  ]);

  return { success: true, notifications, unreadCount };
};

export const deleteNotification = async (userId: string, notificationId: string) => {
  const notification = await Notification.findOne({ _id: notificationId, userId, isDeleted: { $ne: true } });
  if (!notification) {
    throw new Error("Notification not found");
  }

  // Soft delete
  notification.isDeleted = true;
  notification.deletedAt = new Date();
  notification.deletedBy = userId as any;
  await notification.save();

  return { success: true, message: "Notification deleted" };
};
