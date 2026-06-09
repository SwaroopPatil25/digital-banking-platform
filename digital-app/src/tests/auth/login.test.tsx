import "@testing-library/jest-dom/jest-globals";
import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "../../features/auth/Login";
import { renderWithProviders } from "../setup/testUtils";

// Mock react-hot-toast
jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
  Toaster: () => null,
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as object),
  useNavigate: () => mockNavigate,
}));

describe("Login Page", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("should render login form", () => {
    renderWithProviders(<Login />);
    expect(screen.getByRole("heading", { name: "Log In" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Password")).toBeInTheDocument();
  });

  it("should show validation error for invalid email", async () => {
    renderWithProviders(<Login />);
    const emailInput = screen.getByPlaceholderText("Enter Email");
    const passwordInput = screen.getByPlaceholderText("Enter Password");

    fireEvent.change(emailInput, { target: { value: "invalid", name: "email" } });
    fireEvent.change(passwordInput, { target: { value: "123456", name: "password" } });
    fireEvent.submit(emailInput.closest("form")!);

    await waitFor(() => {
      expect(screen.getByText("Invalid Email")).toBeInTheDocument();
    });
  });

  it("should show validation error for short password", async () => {
    renderWithProviders(<Login />);
    const emailInput = screen.getByPlaceholderText("Enter Email");
    const passwordInput = screen.getByPlaceholderText("Enter Password");

    fireEvent.change(emailInput, { target: { value: "user@bank.com", name: "email" } });
    fireEvent.change(passwordInput, { target: { value: "123", name: "password" } });
    fireEvent.submit(emailInput.closest("form")!);

    await waitFor(() => {
      expect(screen.getByText("Length should be more than 5")).toBeInTheDocument();
    });
  });

  it("should display login error from Redux state", () => {
    renderWithProviders(<Login />, {
      preloadedState: {
        auth: {
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          loginError: "Invalid credentials",
          sessionExpired: false,
        },
      },
    });
    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
  });

  it("should show loading text when submitting", () => {
    renderWithProviders(<Login />, {
      preloadedState: {
        auth: {
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: true,
          loginError: null,
          sessionExpired: false,
        },
      },
    });
    expect(screen.getByText("Logging in...")).toBeInTheDocument();
  });

  it("should have a register button", () => {
    renderWithProviders(<Login />);
    expect(screen.getByText("Register")).toBeInTheDocument();
  });
});
