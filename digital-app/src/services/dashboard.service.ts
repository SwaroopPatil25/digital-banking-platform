import { getDashboardApi } from "../api/dashboard.api";
import type { DashboardResponse } from "../types/dashboard.types";

export const getDashboardService = async (): Promise<DashboardResponse> => {
  const response = await getDashboardApi();
  const raw = response.data;
  // Support both { data: {...} } and direct structure
  const resolved = raw?.data || raw;
  return {
    success: raw?.success ?? false,
    data: {
      user: resolved?.user || { username: "" },
      account: resolved?.account || { balance: 0, accountNumber: "", creditScore: 0, rewardPoints: 0 },
      transactions: Array.isArray(resolved?.transactions) ? resolved.transactions : [],
      notifications: Array.isArray(resolved?.notifications) ? resolved.notifications : [],
      counts: resolved?.counts || undefined,
    },
  };
};
