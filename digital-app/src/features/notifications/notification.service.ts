import {
  getLatestNotificationsApi,
  getNotificationsApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
} from "./notification.api";
import type { NotificationResponse } from "./notification.types";

export const getLatestNotificationsService = async (): Promise<NotificationResponse> => {
  const response = await getLatestNotificationsApi();
  const data = response.data as any;
  const items = data?.notifications || data?.data?.notifications || data?.data?.items || data?.data || [];
  return {
    success: data?.success ?? false,
    notifications: Array.isArray(items) ? items : [],
    unreadCount: data?.unreadCount ?? data?.data?.unreadCount ?? 0,
  };
};

export const getNotificationsService = async (): Promise<NotificationResponse> => {
  const response = await getNotificationsApi();
  const data = response.data as any;
  const items = data?.notifications || data?.data?.notifications || data?.data?.items || data?.data || [];
  return {
    success: data?.success ?? false,
    notifications: Array.isArray(items) ? items : [],
    unreadCount: data?.unreadCount ?? data?.data?.unreadCount ?? 0,
  };
};

export const markNotificationReadService = async (id: string): Promise<void> => {
  await markNotificationReadApi(id);
};

export const markAllNotificationsReadService = async (): Promise<void> => {
  await markAllNotificationsReadApi();
};
