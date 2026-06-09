import "@testing-library/jest-dom/jest-globals";
import { jest, describe, it, expect } from "@jest/globals";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import NotificationDropdown from "../../features/notifications/components/NotificationDropdown";

describe("NotificationDropdown", () => {
  const mockOnRead = jest.fn();
  const mockOnMarkAllRead = jest.fn();

  it("should show empty state when no notifications", () => {
    render(<NotificationDropdown notifications={[]} onRead={mockOnRead} onMarkAllRead={mockOnMarkAllRead} />);
    expect(screen.getByText("No notifications")).toBeInTheDocument();
  });

  it("should render notifications list", () => {
    const notifications = [
      { _id: "1", message: "Transfer completed", isRead: false, createdAt: "2024-01-01" },
      { _id: "2", message: "Bill paid", isRead: true, createdAt: "2024-01-02" },
    ];
    render(<NotificationDropdown notifications={notifications} onRead={mockOnRead} onMarkAllRead={mockOnMarkAllRead} />);
    expect(screen.getByText("Transfer completed")).toBeInTheDocument();
    expect(screen.getByText("Bill paid")).toBeInTheDocument();
  });

  it("should show mark all read button when unread exist", () => {
    const notifications = [{ _id: "1", message: "Unread", isRead: false, createdAt: "" }];
    render(<NotificationDropdown notifications={notifications} onRead={mockOnRead} onMarkAllRead={mockOnMarkAllRead} />);
    expect(screen.getByText("Mark all as read")).toBeInTheDocument();
  });

  it("should not show mark all read when all are read", () => {
    const notifications = [{ _id: "1", message: "Read", isRead: true, createdAt: "" }];
    render(<NotificationDropdown notifications={notifications} onRead={mockOnRead} onMarkAllRead={mockOnMarkAllRead} />);
    expect(screen.queryByText("Mark all as read")).not.toBeInTheDocument();
  });

  it("should call onMarkAllRead when button clicked", () => {
    const notifications = [{ _id: "1", message: "Test", isRead: false, createdAt: "" }];
    render(<NotificationDropdown notifications={notifications} onRead={mockOnRead} onMarkAllRead={mockOnMarkAllRead} />);
    fireEvent.click(screen.getByText("Mark all as read"));
    expect(mockOnMarkAllRead).toHaveBeenCalled();
  });

  it("should handle undefined notifications gracefully", () => {
    render(<NotificationDropdown notifications={undefined as unknown as []} onRead={mockOnRead} onMarkAllRead={mockOnMarkAllRead} />);
    expect(screen.getByText("No notifications")).toBeInTheDocument();
  });
});
