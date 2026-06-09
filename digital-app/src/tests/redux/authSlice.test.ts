import { describe, it, expect } from "@jest/globals";
import authReducer, {
  setSessionExpired,
  clearAuthError,
  resetSessionExpired,
  loginUser,
  logoutUser,
} from "../../store/slices/authSlice";

describe("authSlice", () => {
  const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    loginError: null,
    sessionExpired: false,
  };

  it("should return initial state", () => {
    expect(authReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  it("should handle setSessionExpired", () => {
    const authedState = { ...initialState, isAuthenticated: true, token: "abc", user: { id: "1", username: "test", email: "test@test.com", role: "user" } };
    const result = authReducer(authedState, setSessionExpired());
    expect(result.sessionExpired).toBe(true);
    expect(result.isAuthenticated).toBe(false);
    expect(result.token).toBeNull();
    expect(result.user).toBeNull();
  });

  it("should handle clearAuthError", () => {
    const errorState = { ...initialState, loginError: "Invalid credentials" };
    const result = authReducer(errorState, clearAuthError());
    expect(result.loginError).toBeNull();
  });

  it("should handle resetSessionExpired", () => {
    const expiredState = { ...initialState, sessionExpired: true };
    const result = authReducer(expiredState, resetSessionExpired());
    expect(result.sessionExpired).toBe(false);
  });

  it("should set loading on loginUser.pending", () => {
    const result = authReducer(initialState, loginUser.pending("", { email: "", password: "" }));
    expect(result.isLoading).toBe(true);
    expect(result.loginError).toBeNull();
  });

  it("should set user and token on loginUser.fulfilled", () => {
    const payload = { token: "jwt123", user: { id: "1", username: "John", email: "john@bank.com", role: "user" } };
    const result = authReducer(initialState, loginUser.fulfilled(payload, "", { email: "", password: "" }));
    expect(result.isAuthenticated).toBe(true);
    expect(result.token).toBe("jwt123");
    expect(result.user?.username).toBe("John");
    expect(result.isLoading).toBe(false);
  });

  it("should set error on loginUser.rejected", () => {
    const result = authReducer(initialState, loginUser.rejected(null, "", { email: "", password: "" }, "Bad credentials"));
    expect(result.isLoading).toBe(false);
    expect(result.loginError).toBe("Bad credentials");
  });

  it("should clear state on logoutUser.fulfilled", () => {
    const authedState = { ...initialState, isAuthenticated: true, token: "abc", user: { id: "1", username: "test", email: "t@t.com", role: "user" } };
    const result = authReducer(authedState, logoutUser.fulfilled(undefined, ""));
    expect(result.isAuthenticated).toBe(false);
    expect(result.token).toBeNull();
    expect(result.user).toBeNull();
  });
});
