import { describe, it, expect } from "@jest/globals";
import notificationReducer, {
  clearNotifications,
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../store/slices/notificationSlice";

describe("notificationSlice", () => {
  const initialState = {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
  };

  it("should return initial state", () => {
    expect(notificationReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  it("should clear notifications", () => {
    const loadedState = { ...initialState, notifications: [{ _id: "1", message: "hi", isRead: false, createdAt: "" }], unreadCount: 1 };
    const result = notificationReducer(loadedState, clearNotifications());
    expect(result.notifications).toEqual([]);
    expect(result.unreadCount).toBe(0);
  });

  it("should set loading on fetchNotifications.pending", () => {
    const result = notificationReducer(initialState, fetchNotifications.pending("", undefined));
    expect(result.loading).toBe(true);
  });

  it("should populate on fetchNotifications.fulfilled", () => {
    const payload = {
      notifications: [{ _id: "1", message: "Transfer done", isRead: false, createdAt: "2024-01-01" }],
      unreadCount: 1,
    };
    const result = notificationReducer(initialState, fetchNotifications.fulfilled(payload, "", undefined));
    expect(result.loading).toBe(false);
    expect(result.notifications).toHaveLength(1);
    expect(result.unreadCount).toBe(1);
    expect(result.error).toBeNull();
  });

  it("should set error on fetchNotifications.rejected", () => {
    const result = notificationReducer(initialState, fetchNotifications.rejected(null, "", undefined, "Network error"));
    expect(result.loading).toBe(false);
    expect(result.error).toBe("Network error");
  });

  it("should mark notification as read", () => {
    const stateWithNotifs = {
      ...initialState,
      notifications: [
        { _id: "1", message: "A", isRead: false, createdAt: "" },
        { _id: "2", message: "B", isRead: false, createdAt: "" },
      ],
      unreadCount: 2,
    };
    const result = notificationReducer(stateWithNotifs, markNotificationRead.fulfilled("1", "", "1"));
    expect(result.notifications[0].isRead).toBe(true);
    expect(result.notifications[1].isRead).toBe(false);
    expect(result.unreadCount).toBe(1);
  });

  it("should mark all notifications as read", () => {
    const stateWithNotifs = {
      ...initialState,
      notifications: [
        { _id: "1", message: "A", isRead: false, createdAt: "" },
        { _id: "2", message: "B", isRead: false, createdAt: "" },
      ],
      unreadCount: 2,
    };
    const result = notificationReducer(stateWithNotifs, markAllNotificationsRead.fulfilled(undefined, ""));
    expect(result.notifications.every((n) => n.isRead)).toBe(true);
    expect(result.unreadCount).toBe(0);
  });
});
