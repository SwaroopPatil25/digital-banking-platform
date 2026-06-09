import { createSelector } from "reselect";
import type { RootState } from "../store";

const selectBeneficiaryState = (state: RootState) => state.beneficiaries;

export const selectBeneficiaries = createSelector(selectBeneficiaryState, (b) => b.beneficiaries);
export const selectBeneficiaryLoading = createSelector(selectBeneficiaryState, (b) => b.loading);
export const selectBeneficiaryFilters = createSelector(selectBeneficiaryState, (b) => b.filters);

export const selectActiveBeneficiaries = createSelector(selectBeneficiaries, (items) =>
  items.filter((b) => (b.status || "ACTIVE") === "ACTIVE")
);

export const selectPendingBeneficiaries = createSelector(selectBeneficiaries, (items) =>
  items.filter((b) => b.status === "PENDING_APPROVAL")
);

export const selectRecentBeneficiaries = createSelector(selectBeneficiaries, (items) =>
  [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
);

export const selectBeneficiaryBankOptions = createSelector(selectBeneficiaries, (items) =>
  [...new Set(items.map((b) => b.bankName))].sort()
);

export const selectIsBeneficiaryStale = createSelector(selectBeneficiaryState, (b) => {
  if (!b.lastFetched) return true;
  return Date.now() - b.lastFetched > 30000;
});
