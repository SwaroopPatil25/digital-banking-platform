import "@testing-library/jest-dom/jest-globals";
import { describe, it, expect } from "@jest/globals";
import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import NotificationBell from "../../features/notifications/components/NotificationBell";
import { renderWithProviders } from "../setup/testUtils";

describe("NotificationBell", () => {
  it("should render bell button", () => {
    renderWithProviders(<NotificationBell />);
    expect(screen.getByRole("button", { name: /notifications/i })).toBeInTheDocument();
  });

  it("should show unread badge when count > 0", () => {
    renderWithProviders(<NotificationBell />, {
      preloadedState: {
        notifications: {
          notifications: [{ _id: "1", message: "Test", isRead: false, createdAt: "" }],
          unreadCount: 3,
          loading: false,
          error: null,
        },
      },
    });
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("should show 9+ when unread count exceeds 9", () => {
    renderWithProviders(<NotificationBell />, {
      preloadedState: {
        notifications: {
          notifications: [],
          unreadCount: 15,
          loading: false,
          error: null,
        },
      },
    });
    expect(screen.getByText("9+")).toBeInTheDocument();
  });

  it("should toggle dropdown on click", () => {
    renderWithProviders(<NotificationBell />, {
      preloadedState: {
        notifications: {
          notifications: [{ _id: "1", message: "Hello notification", isRead: false, createdAt: "2024-01-01" }],
          unreadCount: 1,
          loading: false,
          error: null,
        },
      },
    });
    fireEvent.click(screen.getByRole("button", { name: /notifications/i }));
    expect(screen.getByText("Hello notification")).toBeInTheDocument();
  });

  it("should not show badge when unread count is 0", () => {
    renderWithProviders(<NotificationBell />, {
      preloadedState: {
        notifications: { notifications: [], unreadCount: 0, loading: false, error: null },
      },
    });
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });
});
