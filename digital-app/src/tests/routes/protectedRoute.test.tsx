import "@testing-library/jest-dom/jest-globals";
import { describe, it, expect } from "@jest/globals";
import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../../shared/routes/ProtectedRoute";
import { createTestStore } from "../setup/testUtils";

const ProtectedContent = () => <div>Protected Content</div>;
const LoginPage = () => <div>Login Page</div>;

function renderRoute(isAuthenticated: boolean, route = "/dashboard") {
  const store = createTestStore({
    auth: {
      user: isAuthenticated ? { id: "1", username: "Test", email: "t@t.com", role: "user" } : null,
      token: isAuthenticated ? "token123" : null,
      isAuthenticated,
      isLoading: false,
      loginError: null,
      sessionExpired: false,
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><ProtectedContent /></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

describe("ProtectedRoute", () => {
  it("should render children when authenticated", () => {
    renderRoute(true);
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("should redirect to login when not authenticated", () => {
    renderRoute(false);
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });
});
