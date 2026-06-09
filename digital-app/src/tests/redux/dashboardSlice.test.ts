import { describe, it, expect } from "@jest/globals";
import dashboardReducer, {
  updateBalance,
  clearDashboard,
  fetchDashboardData,
} from "../../store/slices/dashboardSlice";

describe("dashboardSlice", () => {
  const initialState = {
    user: null,
    account: null,
    recentTransactions: [],
    counts: null,
    loading: false,
    error: null,
    lastFetched: null,
  };

  it("should return initial state", () => {
    expect(dashboardReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  it("should update balance", () => {
    const stateWithAccount = {
      ...initialState,
      account: { balance: 50000, accountNumber: "123456", creditScore: 750, rewardPoints: 100 },
    };
    const result = dashboardReducer(stateWithAccount, updateBalance(45000));
    expect(result.account?.balance).toBe(45000);
  });

  it("should not crash updateBalance when account is null", () => {
    const result = dashboardReducer(initialState, updateBalance(1000));
    expect(result.account).toBeNull();
  });

  it("should clear dashboard", () => {
    const loadedState = {
      ...initialState,
      user: { username: "Test" },
      account: { balance: 1000, accountNumber: "123", creditScore: 700, rewardPoints: 50 },
      lastFetched: Date.now(),
    };
    const result = dashboardReducer(loadedState, clearDashboard());
    expect(result.user).toBeNull();
    expect(result.account).toBeNull();
    expect(result.lastFetched).toBeNull();
  });

  it("should set loading on fetchDashboardData.pending", () => {
    const result = dashboardReducer(initialState, fetchDashboardData.pending("", undefined));
    expect(result.loading).toBe(true);
    expect(result.error).toBeNull();
  });

  it("should populate state on fetchDashboardData.fulfilled", () => {
    const payload = {
      user: { username: "Banker" },
      account: { balance: 100000, accountNumber: "9876543210", creditScore: 800, rewardPoints: 500 },
      transactions: [],
      counts: null,
    };
    const result = dashboardReducer(initialState, fetchDashboardData.fulfilled(payload, "", undefined));
    expect(result.loading).toBe(false);
    expect(result.user?.username).toBe("Banker");
    expect(result.account?.balance).toBe(100000);
    expect(result.lastFetched).not.toBeNull();
  });

  it("should set error on fetchDashboardData.rejected", () => {
    const result = dashboardReducer(initialState, fetchDashboardData.rejected(null, "", undefined, "Network error"));
    expect(result.loading).toBe(false);
    expect(result.error).toBe("Network error");
  });
});
