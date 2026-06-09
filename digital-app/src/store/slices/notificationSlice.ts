import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getLatestNotificationsApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
} from "../../features/notifications/notification.api";
import type { Notification } from "../../features/notifications/notification.types";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

export const fetchNotifications = createAsyncThunk<
  { notifications: Notification[]; unreadCount: number },
  void,
  { rejectValue: string }
>("notifications/fetch", async (_, { rejectWithValue }) => {
  try {
    const response = await getLatestNotificationsApi();
    const data = response.data as any;
    const items = data?.notifications || data?.data || [];
    return {
      notifications: Array.isArray(items) ? items : [],
      unreadCount: data?.unreadCount ?? 0,
    };
  } catch {
    return rejectWithValue("Failed to load notifications");
  }
});

export const markNotificationRead = createAsyncThunk<string, string>(
  "notifications/markRead",
  async (id) => {
    await markNotificationReadApi(id);
    return id;
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  "notifications/markAllRead",
  async () => {
    await markAllNotificationsReadApi();
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    clearNotifications(state) {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
        state.error = null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load notifications";
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const id = action.payload;
        state.notifications = state.notifications.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        );
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map((n) => ({ ...n, isRead: true }));
        state.unreadCount = 0;
      });
  },
});

export const { clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
