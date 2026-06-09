import type { Middleware } from "@reduxjs/toolkit";
import { clearDashboard } from "../slices/dashboardSlice";
import { clearNotifications } from "../slices/notificationSlice";
import { clearTransactionFilters, clearSelectedTransaction } from "../slices/transactionSlice";
import { clearBeneficiaryFilters, clearSelectedBeneficiary } from "../slices/beneficiarySlice";
import { clearActivityFilters, clearSelectedActivity } from "../slices/activitySlice";

/**
 * Session Middleware
 * On logout or session expiry, clears all sensitive business data from Redux.
 */
export const sessionMiddleware: Middleware = (storeApi) => (next) => (action) => {
  const result = next(action);

  const type = (action as { type?: string }).type;
  if (type === "auth/logoutUser/fulfilled" || type === "auth/setSessionExpired") {
    storeApi.dispatch(clearDashboard());
    storeApi.dispatch(clearNotifications());
    storeApi.dispatch(clearTransactionFilters());
    storeApi.dispatch(clearSelectedTransaction());
    storeApi.dispatch(clearBeneficiaryFilters());
    storeApi.dispatch(clearSelectedBeneficiary());
    storeApi.dispatch(clearActivityFilters());
    storeApi.dispatch(clearSelectedActivity());
  }

  return result;
};
