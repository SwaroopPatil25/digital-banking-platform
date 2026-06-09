import { describe, it, expect, beforeEach } from "@jest/globals";
import { setToken, getToken, removeToken, isAuthenticated } from "../../utils/token";

describe("token utils", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("setToken stores token in localStorage", () => {
    setToken("abc123");
    expect(localStorage.getItem("token")).toBe("abc123");
  });

  it("getToken retrieves stored token", () => {
    localStorage.setItem("token", "xyz");
    expect(getToken()).toBe("xyz");
  });

  it("getToken returns null when no token", () => {
    expect(getToken()).toBeNull();
  });

  it("removeToken clears token from localStorage", () => {
    localStorage.setItem("token", "abc");
    removeToken();
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("isAuthenticated returns true when token exists", () => {
    localStorage.setItem("token", "valid");
    expect(isAuthenticated()).toBe(true);
  });

  it("isAuthenticated returns false when no token", () => {
    expect(isAuthenticated()).toBe(false);
  });
});
