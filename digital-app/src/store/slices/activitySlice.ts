import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axios";
import { extractArray, extractPagination, type PaginationMeta } from "../../utils/apiHelpers";
import type { RootState } from "../store";

export interface ActivityRecord {
  _id: string;
  action: string;
  description: string;
  ipAddress?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

interface ActivityFilters {
  action: string;
  search: string;
  date: string;
}

interface ActivityState {
  activities: ActivityRecord[];
  selectedActivity: ActivityRecord | null;
  pagination: PaginationMeta;
  filters: ActivityFilters;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: ActivityState = {
  activities: [],
  selectedActivity: null,
  pagination: { page: 1, limit: 15, totalPages: 1, hasNext: false, hasPrevious: false, total: 0 },
  filters: { action: "", search: "", date: "" },
  loading: false,
  error: null,
  lastFetched: null,
};

interface FetchActivityParams {
  page?: number;
  debouncedSearch?: string;
}

export const fetchActivityHistory = createAsyncThunk<
  { activities: ActivityRecord[]; pagination: PaginationMeta },
  FetchActivityParams | void,
  { state: RootState; rejectValue: string }
>("activity/fetch", async (params, { getState, rejectWithValue }) => {
  try {
    const state = getState().activity;
    const page = params?.page ?? 1;
    const search = params?.debouncedSearch ?? state.filters.search;

    const queryParams: Record<string, string | number> = { page, limit: 15 };
    if (state.filters.action) queryParams.action = state.filters.action;
    if (search) queryParams.search = search;
    if (state.filters.date) queryParams.date = state.filters.date;

    const res = await axiosInstance.get("/activity", { params: queryParams });
    const data = res.data;
    return {
      activities: extractArray<ActivityRecord>(data, "activities"),
      pagination: extractPagination(data),
    };
  } catch {
    return rejectWithValue("Failed to load activity history");
  }
});

const activitySlice = createSlice({
  name: "activity",
  initialState,
  reducers: {
    setActivityFilters(state, action: PayloadAction<Partial<ActivityFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearActivityFilters(state) {
      state.filters = { action: "", search: "", date: "" };
    },
    setSelectedActivity(state, action: PayloadAction<ActivityRecord | null>) {
      state.selectedActivity = action.payload;
    },
    clearSelectedActivity(state) {
      state.selectedActivity = null;
    },
    clearActivityError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivityHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivityHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload.activities;
        state.pagination = action.payload.pagination;
        state.lastFetched = Date.now();
      })
      .addCase(fetchActivityHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load activity history";
        state.activities = [];
      });
  },
});

export const {
  setActivityFilters,
  clearActivityFilters,
  setSelectedActivity,
  clearSelectedActivity,
  clearActivityError,
} = activitySlice.actions;
export default activitySlice.reducer;
