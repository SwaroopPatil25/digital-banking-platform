import { createSelector } from "reselect";
import type { RootState } from "../store";

const selectDashboard = (state: RootState) => state.dashboard;

export const selectAccount = createSelector(selectDashboard, (d) => d.account);

export const selectFormattedBalance = createSelector(selectAccount, (account) =>
  account ? `₹ ${account.balance.toLocaleString("en-IN")}` : "₹ 0"
);

export const selectMaskedAccountNumber = createSelector(selectAccount, (account) => {
  const accNo = account?.accountNumber;
  if (!accNo) return "N/A";
  if (accNo.length <= 4) return accNo;
  return "X".repeat(accNo.length - 4) + accNo.slice(-4);
});

export const selectDashboardUser = createSelector(selectDashboard, (d) => d.user);
export const selectDashboardCounts = createSelector(selectDashboard, (d) => d.counts);
export const selectDashboardLoading = createSelector(selectDashboard, (d) => d.loading);
export const selectDashboardError = createSelector(selectDashboard, (d) => d.error);

export const selectIsDashboardStale = createSelector(selectDashboard, (d) => {
  if (!d.lastFetched) return true;
  return Date.now() - d.lastFetched > 60000; // stale after 60s
});
