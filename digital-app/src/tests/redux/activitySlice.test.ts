import { describe, it, expect } from "@jest/globals";
import activityReducer, {
  setActivityFilters,
  clearActivityFilters,
  setSelectedActivity,
  clearSelectedActivity,
  clearActivityError,
  fetchActivityHistory,
} from "../../store/slices/activitySlice";
import type { ActivityRecord } from "../../store/slices/activitySlice";

const mockActivity: ActivityRecord = {
  _id: "a1",
  action: "LOGIN",
  description: "User logged in",
  createdAt: "2024-01-15T09:00:00Z",
  ipAddress: "192.168.1.1",
};

describe("activitySlice", () => {
  const initialState = {
    activities: [],
    selectedActivity: null,
    pagination: { page: 1, limit: 15, totalPages: 1, hasNext: false, hasPrevious: false, total: 0 },
    filters: { action: "", search: "", date: "" },
    loading: false,
    error: null,
    lastFetched: null,
  };

  it("should return initial state", () => {
    expect(activityReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  it("should set activity filters", () => {
    const result = activityReducer(initialState, setActivityFilters({ action: "TRANSFER", search: "john" }));
    expect(result.filters.action).toBe("TRANSFER");
    expect(result.filters.search).toBe("john");
  });

  it("should clear activity filters", () => {
    const filtered = { ...initialState, filters: { action: "LOGIN", search: "test", date: "2024-01-01" } };
    const result = activityReducer(filtered, clearActivityFilters());
    expect(result.filters).toEqual({ action: "", search: "", date: "" });
  });

  it("should set selected activity", () => {
    const result = activityReducer(initialState, setSelectedActivity(mockActivity));
    expect(result.selectedActivity?._id).toBe("a1");
  });

  it("should clear selected activity", () => {
    const withSelected = { ...initialState, selectedActivity: mockActivity };
    const result = activityReducer(withSelected, clearSelectedActivity());
    expect(result.selectedActivity).toBeNull();
  });

  it("should clear error", () => {
    const withError = { ...initialState, error: "Failed" };
    const result = activityReducer(withError, clearActivityError());
    expect(result.error).toBeNull();
  });

  it("should set loading on fetchActivityHistory.pending", () => {
    const result = activityReducer(initialState, fetchActivityHistory.pending("", undefined));
    expect(result.loading).toBe(true);
    expect(result.error).toBeNull();
  });

  it("should populate on fetchActivityHistory.fulfilled", () => {
    const payload = {
      activities: [mockActivity],
      pagination: { page: 1, limit: 15, totalPages: 3, hasNext: true, hasPrevious: false, total: 45 },
    };
    const result = activityReducer(initialState, fetchActivityHistory.fulfilled(payload, "", undefined));
    expect(result.loading).toBe(false);
    expect(result.activities).toHaveLength(1);
    expect(result.pagination.totalPages).toBe(3);
    expect(result.lastFetched).not.toBeNull();
  });

  it("should set error on fetchActivityHistory.rejected", () => {
    const result = activityReducer(initialState, fetchActivityHistory.rejected(null, "", undefined, "Failed to load activity history"));
    expect(result.loading).toBe(false);
    expect(result.error).toBe("Failed to load activity history");
    expect(result.activities).toEqual([]);
  });
});
