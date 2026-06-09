import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axios";
import { extractArray, extractPagination, type PaginationMeta } from "../../utils/apiHelpers";
import type { Transaction, TransactionFilters } from "../../features/transactions/transactions.types";
import type { RootState } from "../store";

const EMPTY_FILTERS: TransactionFilters = {
  type: "", status: "", category: "", startDate: "", endDate: "", minAmount: "", maxAmount: "", search: "",
};

interface TransactionState {
  transactions: Transaction[];
  recentTransactions: Transaction[];
  selectedTransaction: Transaction | null;
  pagination: PaginationMeta;
  filters: TransactionFilters;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: TransactionState = {
  transactions: [],
  recentTransactions: [],
  selectedTransaction: null,
  pagination: { page: 1, limit: 10, totalPages: 1, hasNext: false, hasPrevious: false, total: 0 },
  filters: EMPTY_FILTERS,
  loading: false,
  error: null,
  lastFetched: null,
};

interface FetchParams {
  page?: number;
  filters?: TransactionFilters;
  debouncedSearch?: string;
}

export const fetchTransactions = createAsyncThunk<
  { transactions: Transaction[]; pagination: PaginationMeta },
  FetchParams | void,
  { state: RootState; rejectValue: string }
>("transactions/fetch", async (params, { getState, rejectWithValue }) => {
  try {
    const state = getState().transactions;
    const filters = params?.filters ?? state.filters;
    const page = params?.page ?? state.pagination.page;
    const search = params?.debouncedSearch ?? filters.search;

    const queryParams: Record<string, string | number> = { page, limit: 10 };
    if (filters.type) queryParams.type = filters.type;
    if (filters.status) queryParams.status = filters.status;
    if (filters.category) queryParams.category = filters.category;
    if (filters.startDate) queryParams.startDate = filters.startDate;
    if (filters.endDate) queryParams.endDate = filters.endDate;
    if (filters.minAmount) queryParams.minAmount = filters.minAmount;
    if (filters.maxAmount) queryParams.maxAmount = filters.maxAmount;
    if (search) queryParams.search = search;

    const res = await axiosInstance.get("/transactions", { params: queryParams });
    const data = res.data;
    return {
      transactions: extractArray<Transaction>(data, "transactions"),
      pagination: extractPagination(data),
    };
  } catch {
    return rejectWithValue("Failed to load transactions");
  }
});

export const fetchRecentTransactions = createAsyncThunk<
  Transaction[],
  number | void,
  { rejectValue: string }
>("transactions/fetchRecent", async (limit = 5, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get("/transactions", { params: { limit, page: 1 } });
    return extractArray<Transaction>(res.data, "transactions");
  } catch {
    return rejectWithValue("Failed to load recent transactions");
  }
});

const transactionSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    setTransactionFilters(state, action: PayloadAction<TransactionFilters>) {
      state.filters = action.payload;
    },
    clearTransactionFilters(state) {
      state.filters = EMPTY_FILTERS;
    },
    setSelectedTransaction(state, action: PayloadAction<Transaction | null>) {
      state.selectedTransaction = action.payload;
    },
    clearSelectedTransaction(state) {
      state.selectedTransaction = null;
    },
    clearTransactionError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.transactions;
        state.pagination = action.payload.pagination;
        state.lastFetched = Date.now();
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load transactions";
        state.transactions = [];
      })
      .addCase(fetchRecentTransactions.fulfilled, (state, action) => {
        state.recentTransactions = action.payload;
      });
  },
});

export const {
  setTransactionFilters,
  clearTransactionFilters,
  setSelectedTransaction,
  clearSelectedTransaction,
  clearTransactionError,
} = transactionSlice.actions;
export default transactionSlice.reducer;
