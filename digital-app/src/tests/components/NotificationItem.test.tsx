import "@testing-library/jest-dom/jest-globals";
import { jest, describe, it, expect } from "@jest/globals";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import NotificationItem from "../../features/notifications/components/NotificationItem";

describe("NotificationItem", () => {
  const mockOnRead = jest.fn();

  it("should render notification message", () => {
    const notification = { _id: "1", message: "Transfer of ₹5000 successful", isRead: false, createdAt: new Date().toISOString() };
    render(<NotificationItem notification={notification} onRead={mockOnRead} />);
    expect(screen.getByText("Transfer of ₹5000 successful")).toBeInTheDocument();
  });

  it("should call onRead when unread notification is clicked", () => {
    const notification = { _id: "n1", message: "Click me", isRead: false, createdAt: new Date().toISOString() };
    render(<NotificationItem notification={notification} onRead={mockOnRead} />);
    fireEvent.click(screen.getByRole("button"));
    expect(mockOnRead).toHaveBeenCalledWith("n1");
  });

  it("should not call onRead when already read", () => {
    mockOnRead.mockClear();
    const notification = { _id: "n2", message: "Already read", isRead: true, createdAt: new Date().toISOString() };
    render(<NotificationItem notification={notification} onRead={mockOnRead} />);
    fireEvent.click(screen.getByRole("button"));
    expect(mockOnRead).not.toHaveBeenCalled();
  });

  it("should show 'Just now' for recent notifications", () => {
    const notification = { _id: "1", message: "New", isRead: false, createdAt: new Date().toISOString() };
    render(<NotificationItem notification={notification} onRead={mockOnRead} />);
    expect(screen.getByText("Just now")).toBeInTheDocument();
  });

  it("should show relative time for older notifications", () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const notification = { _id: "1", message: "Old", isRead: false, createdAt: twoHoursAgo };
    render(<NotificationItem notification={notification} onRead={mockOnRead} />);
    expect(screen.getByText("2h ago")).toBeInTheDocument();
  });
});
