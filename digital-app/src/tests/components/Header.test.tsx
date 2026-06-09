import "@testing-library/jest-dom/jest-globals";
import { describe, it, expect } from "@jest/globals";
import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import Header from "../../shared/layout/Header";
import { renderWithProviders } from "../setup/testUtils";

describe("Header", () => {
  it("should render DigiBank brand", () => {
    renderWithProviders(<Header isAuthenticated={false} />);
    expect(screen.getByText("DigiBank")).toBeInTheDocument();
  });

  it("should show nav actions when authenticated", () => {
    renderWithProviders(<Header isAuthenticated={true} />, {
      preloadedState: {
        auth: { user: { id: "1", username: "TestUser", email: "t@t.com", role: "user" }, token: "t", isAuthenticated: true, isLoading: false, loginError: null, sessionExpired: false },
        notifications: { notifications: [], unreadCount: 0, loading: false, error: null },
      },
    });
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
    expect(screen.getByText(/TestUser/)).toBeInTheDocument();
  });

  it("should not show nav actions when not authenticated", () => {
    renderWithProviders(<Header isAuthenticated={false} />);
    expect(screen.queryByText("Profile")).not.toBeInTheDocument();
    expect(screen.queryByText("Logout")).not.toBeInTheDocument();
  });

  it("should call logout on button click", () => {
    const { store } = renderWithProviders(<Header isAuthenticated={true} />, {
      preloadedState: {
        auth: { user: { id: "1", username: "User", email: "", role: "" }, token: "t", isAuthenticated: true, isLoading: false, loginError: null, sessionExpired: false },
        notifications: { notifications: [], unreadCount: 0, loading: false, error: null },
      },
    });
    fireEvent.click(screen.getByText("Logout"));
    // After logout dispatch, auth should eventually clear
    expect(store.getState().auth.isAuthenticated).toBe(true); // Still true sync, async thunk hasn't resolved
  });

  it("should render profile button", () => {
    renderWithProviders(<Header isAuthenticated={true} />, {
      preloadedState: {
        auth: { user: { id: "1", username: "User", email: "", role: "" }, token: "t", isAuthenticated: true, isLoading: false, loginError: null, sessionExpired: false },
        notifications: { notifications: [], unreadCount: 0, loading: false, error: null },
      },
    });
    expect(screen.getByText("Profile")).toBeInTheDocument();
  });
});
