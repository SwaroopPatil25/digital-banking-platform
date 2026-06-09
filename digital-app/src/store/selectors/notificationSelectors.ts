import { createSelector } from "reselect";
import type { RootState } from "../store";

const selectNotificationState = (state: RootState) => state.notifications;

export const selectNotifications = createSelector(selectNotificationState, (n) => n.notifications);
export const selectUnreadCount = createSelector(selectNotificationState, (n) => n.unreadCount);
export const selectNotificationLoading = createSelector(selectNotificationState, (n) => n.loading);

export const selectUnreadNotifications = createSelector(selectNotifications, (items) =>
  items.filter((n) => !n.isRead)
);

export const selectHighPriorityNotifications = createSelector(selectNotifications, (items) =>
  items.filter((n) => n.priority === "high")
);
