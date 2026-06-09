import { describe, it, expect } from "@jest/globals";
import transactionReducer, {
  setTransactionFilters,
  clearTransactionFilters,
  setSelectedTransaction,
  clearSelectedTransaction,
  clearTransactionError,
  fetchTransactions,
  fetchRecentTransactions,
} from "../../store/slices/transactionSlice";
import type { Transaction, TransactionFilters } from "../../features/transactions/transactions.types";

const mockTxn: Transaction = {
  _id: "t1",
  description: "Transfer to John",
  amount: 5000,
  type: "debit",
  status: "SUCCESS",
  createdAt: "2024-01-15T10:00:00Z",
};

describe("transactionSlice", () => {
  const initialState = {
    transactions: [],
    recentTransactions: [],
    selectedTransaction: null,
    pagination: { page: 1, limit: 10, totalPages: 1, hasNext: false, hasPrevious: false, total: 0 },
    filters: { type: "", status: "", category: "", startDate: "", endDate: "", minAmount: "", maxAmount: "", search: "" } as TransactionFilters,
    loading: false,
    error: null,
    lastFetched: null,
  };

  it("should return initial state", () => {
    expect(transactionReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  it("should set filters", () => {
    const filters: TransactionFilters = { ...initialState.filters, type: "debit", status: "SUCCESS" };
    const result = transactionReducer(initialState, setTransactionFilters(filters));
    expect(result.filters.type).toBe("debit");
    expect(result.filters.status).toBe("SUCCESS");
  });

  it("should clear filters", () => {
    const filtered = { ...initialState, filters: { ...initialState.filters, type: "credit" as const, search: "rent" } };
    const result = transactionReducer(filtered, clearTransactionFilters());
    expect(result.filters.type).toBe("");
    expect(result.filters.search).toBe("");
  });

  it("should set selected transaction", () => {
    const result = transactionReducer(initialState, setSelectedTransaction(mockTxn));
    expect(result.selectedTransaction?._id).toBe("t1");
  });

  it("should clear selected transaction", () => {
    const withSelected = { ...initialState, selectedTransaction: mockTxn };
    const result = transactionReducer(withSelected, clearSelectedTransaction());
    expect(result.selectedTransaction).toBeNull();
  });

  it("should clear error", () => {
    const withError = { ...initialState, error: "Failed" };
    const result = transactionReducer(withError, clearTransactionError());
    expect(result.error).toBeNull();
  });

  it("should set loading on fetchTransactions.pending", () => {
    const result = transactionReducer(initialState, fetchTransactions.pending("", undefined));
    expect(result.loading).toBe(true);
    expect(result.error).toBeNull();
  });

  it("should populate on fetchTransactions.fulfilled", () => {
    const payload = {
      transactions: [mockTxn],
      pagination: { page: 2, limit: 10, totalPages: 5, hasNext: true, hasPrevious: true, total: 50 },
    };
    const result = transactionReducer(initialState, fetchTransactions.fulfilled(payload, "", undefined));
    expect(result.loading).toBe(false);
    expect(result.transactions).toHaveLength(1);
    expect(result.pagination.page).toBe(2);
    expect(result.lastFetched).not.toBeNull();
  });

  it("should set error on fetchTransactions.rejected", () => {
    const result = transactionReducer(initialState, fetchTransactions.rejected(null, "", undefined, "Failed to load transactions"));
    expect(result.loading).toBe(false);
    expect(result.error).toBe("Failed to load transactions");
    expect(result.transactions).toEqual([]);
  });

  it("should populate recent on fetchRecentTransactions.fulfilled", () => {
    const result = transactionReducer(initialState, fetchRecentTransactions.fulfilled([mockTxn], "", undefined));
    expect(result.recentTransactions).toHaveLength(1);
  });
});
