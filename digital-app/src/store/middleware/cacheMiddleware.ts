import type { Middleware } from "@reduxjs/toolkit";
import { fetchDashboardData } from "../slices/dashboardSlice";
import { fetchNotifications } from "../slices/notificationSlice";
import { fetchRecentTransactions } from "../slices/transactionSlice";
import { fetchBeneficiaries } from "../slices/beneficiarySlice";

/**
 * Cache Invalidation Middleware
 *
 * Cross-slice synchronization:
 * - Transfer success → refresh dashboard balance, transactions, notifications
 * - Bill payment success → refresh dashboard, transactions, notifications
 * - Beneficiary added → refresh beneficiary list
 *
 * This middleware listens to specific action types indicating data mutations
 * and triggers refresh of dependent slices.
 */

const TRANSFER_SUCCESS_ACTIONS = [
  "dashboard/updateBalance",
];

const BENEFICIARY_MUTATION_ACTIONS = [
  "beneficiaries/add/fulfilled",
];

export const cacheInvalidationMiddleware: Middleware = (storeApi) => (next) => (action) => {
  const result = next(action);
  const type = (action as { type?: string }).type;
  if (!type) return result;

  // After balance update (transfer/bill success) → refresh related data
  if (TRANSFER_SUCCESS_ACTIONS.includes(type)) {
    storeApi.dispatch(fetchRecentTransactions(5) as any);
    storeApi.dispatch(fetchNotifications() as any);
  }

  // After beneficiary mutation → force refresh list
  if (BENEFICIARY_MUTATION_ACTIONS.includes(type)) {
    storeApi.dispatch(fetchBeneficiaries(true) as any);
  }

  // After dashboard fetch completes, data is fresh - no additional calls needed
  if (type === "dashboard/fetchData/fulfilled") {
    // Dashboard already fetches all needed data in one call
  }

  return result;
};

/**
 * Exported helper for manual cross-slice refresh after complex operations.
 * Use sparingly — prefer the middleware for automatic invalidation.
 */
export const invalidateAfterTransfer = () => (dispatch: (action: unknown) => void) => {
  dispatch(fetchDashboardData());
  dispatch(fetchRecentTransactions(5));
  dispatch(fetchNotifications());
};
