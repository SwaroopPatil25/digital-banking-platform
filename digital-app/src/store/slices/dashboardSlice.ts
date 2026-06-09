import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getDashboardApi } from "../../api/dashboard.api";
import type { DashboardAccount, DashboardTransaction, DashboardCounts } from "../../types/dashboard.types";

interface DashboardState {
  user: { username: string } | null;
  account: DashboardAccount | null;
  recentTransactions: DashboardTransaction[];
  counts: DashboardCounts | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: DashboardState = {
  user: null,
  account: null,
  recentTransactions: [],
  counts: null,
  loading: false,
  error: null,
  lastFetched: null,
};

export const fetchDashboardData = createAsyncThunk<
  { user: { username: string }; account: DashboardAccount; transactions: DashboardTransaction[]; counts: DashboardCounts | null },
  void,
  { rejectValue: string }
>("dashboard/fetchData", async (_, { rejectWithValue }) => {
  try {
    const response = await getDashboardApi();
    const raw = response.data;
    const resolved = raw?.data || raw;
    return {
      user: resolved?.user || { username: "" },
      account: resolved?.account || { balance: 0, accountNumber: "", creditScore: 0, rewardPoints: 0 },
      transactions: Array.isArray(resolved?.transactions) ? resolved.transactions : [],
      counts: resolved?.counts || null,
    };
  } catch {
    return rejectWithValue("Failed to load dashboard");
  }
});

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    updateBalance(state, action: { payload: number }) {
      if (state.account) {
        state.account.balance = action.payload;
      }
    },
    clearDashboard(state) {
      state.user = null;
      state.account = null;
      state.recentTransactions = [];
      state.counts = null;
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.account = action.payload.account;
        state.recentTransactions = action.payload.transactions;
        state.counts = action.payload.counts;
        state.lastFetched = Date.now();
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load dashboard";
      });
  },
});

export const { updateBalance, clearDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;
