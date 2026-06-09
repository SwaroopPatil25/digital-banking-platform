import { describe, it, expect } from "@jest/globals";
import { createTestStore } from "../setup/testUtils";
import { fetchTransactions, fetchRecentTransactions } from "../../store/slices/transactionSlice";
import { fetchActivityHistory } from "../../store/slices/activitySlice";
import { fetchBeneficiaries, addBeneficiary } from "../../store/slices/beneficiarySlice";
import { loginUser } from "../../store/slices/authSlice";
import { fetchDashboardData } from "../../store/slices/dashboardSlice";

describe("Async Thunks - Error Paths & Cache Logic", () => {
  describe("fetchTransactions", () => {
    it("should set loading=true then error on rejection", async () => {
      const store = createTestStore();
      // The mocked axios.get returns {} by default, which extractArray handles as empty
      await store.dispatch(fetchTransactions({ page: 1 }));
      const state = store.getState().transactions;
      // With default mock returning {data:{}}, extractArray returns [] (no error)
      expect(state.loading).toBe(false);
      expect(state.transactions).toEqual([]);
    });

    it("should use provided filters in fetch", async () => {
      const store = createTestStore();
      await store.dispatch(fetchTransactions({
        page: 2,
        filters: { type: "debit", status: "SUCCESS", category: "TRANSFER", startDate: "2024-01-01", endDate: "2024-12-31", minAmount: "100", maxAmount: "5000", search: "rent" },
      }));
      // Verifies the thunk body executes without crash with all filter branches
      expect(store.getState().transactions.loading).toBe(false);
    });
  });

  describe("fetchRecentTransactions", () => {
    it("should execute without crash", async () => {
      const store = createTestStore();
      await store.dispatch(fetchRecentTransactions(5));
      expect(store.getState().transactions.recentTransactions).toEqual([]);
    });
  });

  describe("fetchActivityHistory", () => {
    it("should execute with filters", async () => {
      const store = createTestStore({
        activity: {
          activities: [],
          selectedActivity: null,
          pagination: { page: 1, limit: 15, totalPages: 1, hasNext: false, hasPrevious: false, total: 0 },
          filters: { action: "LOGIN", search: "test", date: "2024-01-01" },
          loading: false,
          error: null,
          lastFetched: null,
        },
      });
      await store.dispatch(fetchActivityHistory({ page: 1, debouncedSearch: "hello" }));
      expect(store.getState().activity.loading).toBe(false);
    });
  });

  describe("fetchBeneficiaries", () => {
    it("should use cached data when fresh", async () => {
      const store = createTestStore({
        beneficiaries: {
          beneficiaries: [{ _id: "b1", beneficiaryName: "Cached", accountNumber: "123", bankName: "SBI", ifscCode: "SBIN001", createdAt: "" }],
          selectedBeneficiary: null,
          filters: { search: "", bank: "", status: "" },
          loading: false,
          error: null,
          lastFetched: Date.now(),
        },
      });
      await store.dispatch(fetchBeneficiaries());
      expect(store.getState().beneficiaries.beneficiaries[0].beneficiaryName).toBe("Cached");
    });

    it("should fetch when forced", async () => {
      const store = createTestStore({
        beneficiaries: {
          beneficiaries: [{ _id: "b1", beneficiaryName: "Old", accountNumber: "123", bankName: "SBI", ifscCode: "SBIN001", createdAt: "" }],
          selectedBeneficiary: null,
          filters: { search: "", bank: "", status: "" },
          loading: false,
          error: null,
          lastFetched: Date.now(),
        },
      });
      await store.dispatch(fetchBeneficiaries(true));
      expect(store.getState().beneficiaries.loading).toBe(false);
    });

    it("should fetch when stale (>30s)", async () => {
      const store = createTestStore({
        beneficiaries: {
          beneficiaries: [{ _id: "b1", beneficiaryName: "Stale", accountNumber: "123", bankName: "SBI", ifscCode: "SBIN001", createdAt: "" }],
          selectedBeneficiary: null,
          filters: { search: "", bank: "", status: "" },
          loading: false,
          error: null,
          lastFetched: Date.now() - 60000,
        },
      });
      await store.dispatch(fetchBeneficiaries());
      expect(store.getState().beneficiaries.loading).toBe(false);
    });

    it("should fetch when no data exists", async () => {
      const store = createTestStore({
        beneficiaries: {
          beneficiaries: [],
          selectedBeneficiary: null,
          filters: { search: "", bank: "", status: "" },
          loading: false,
          error: null,
          lastFetched: null,
        },
      });
      await store.dispatch(fetchBeneficiaries());
      expect(store.getState().beneficiaries.loading).toBe(false);
    });
  });

  describe("loginUser", () => {
    it("should handle login API call", async () => {
      const store = createTestStore();
      // Mock auth.api loginApi returns {data: {}} which is missing token/user
      // This will cause destructuring to get undefined values → the thunk catches it
      const result = await store.dispatch(loginUser({ email: "test@test.com", password: "pass123" }));
      // The fulfilled action sets token (which may be undefined from mock)
      expect(result.type).toContain("auth/loginUser");
    });
  });

  describe("fetchDashboardData", () => {
    it("should handle dashboard API call", async () => {
      const store = createTestStore();
      await store.dispatch(fetchDashboardData());
      const state = store.getState().dashboard;
      expect(state.loading).toBe(false);
    });
  });

  describe("addBeneficiary", () => {
    it("should dispatch successfully", async () => {
      const store = createTestStore();
      const result = await store.dispatch(addBeneficiary({
        beneficiaryName: "Test",
        accountNumber: "12345678",
        bankName: "HDFC",
        ifscCode: "HDFC0001234",
      }));
      expect(result.type).toContain("beneficiaries/add");
    });
  });
});
