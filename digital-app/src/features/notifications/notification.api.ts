import axiosInstance from "../../api/axios";
import type { AxiosResponse } from "axios";
import type { NotificationResponse } from "./notification.types";

export const getLatestNotificationsApi = (): Promise<AxiosResponse<NotificationResponse>> => {
  return axiosInstance.get("/notifications/latest");
};

export const getNotificationsApi = (): Promise<AxiosResponse<NotificationResponse>> => {
  return axiosInstance.get("/notifications");
};

export const markNotificationReadApi = (id: string): Promise<AxiosResponse> => {
  return axiosInstance.patch(`/notifications/${id}/read`);
};

export const markAllNotificationsReadApi = (): Promise<AxiosResponse> => {
  return axiosInstance.patch("/notifications/read-all");
};
