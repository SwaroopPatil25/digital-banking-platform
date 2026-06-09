import { createSelector } from "reselect";
import type { RootState } from "../store";

const selectTransactionState = (state: RootState) => state.transactions;

export const selectTransactions = createSelector(selectTransactionState, (t) => t.transactions);
export const selectRecentTransactions = createSelector(selectTransactionState, (t) => t.recentTransactions);
export const selectTransactionPagination = createSelector(selectTransactionState, (t) => t.pagination);
export const selectTransactionFilters = createSelector(selectTransactionState, (t) => t.filters);
export const selectTransactionLoading = createSelector(selectTransactionState, (t) => t.loading);

export const selectTotalDebit = createSelector(selectTransactions, (txns) =>
  txns.filter((t) => t.type === "debit").reduce((sum, t) => sum + Math.abs(t.amount), 0)
);

export const selectTotalCredit = createSelector(selectTransactions, (txns) =>
  txns.filter((t) => t.type === "credit").reduce((sum, t) => sum + t.amount, 0)
);

export const selectTransactionsByStatus = createSelector(selectTransactions, (txns) => {
  const map: Record<string, number> = {};
  txns.forEach((t) => { map[t.status] = (map[t.status] || 0) + 1; });
  return map;
});

export const selectIsTransactionStale = createSelector(selectTransactionState, (t) => {
  if (!t.lastFetched) return true;
  return Date.now() - t.lastFetched > 30000;
});
