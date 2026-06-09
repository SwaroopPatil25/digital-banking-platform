import { describe, it, expect } from "@jest/globals";
import {
  getLatestNotificationsApi,
  getNotificationsApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
} from "../../features/notifications/notification.api";

describe("Notification API", () => {
  it("getLatestNotificationsApi should resolve", async () => {
    const result = await getLatestNotificationsApi();
    expect(result).toBeDefined();
  });

  it("getNotificationsApi should resolve", async () => {
    const result = await getNotificationsApi();
    expect(result).toBeDefined();
  });

  it("markNotificationReadApi should resolve", async () => {
    const result = await markNotificationReadApi("id-123");
    expect(result).toBeDefined();
  });

  it("markAllNotificationsReadApi should resolve", async () => {
    const result = await markAllNotificationsReadApi();
    expect(result).toBeDefined();
  });
});
