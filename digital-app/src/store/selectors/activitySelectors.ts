import { createSelector } from "reselect";
import type { RootState } from "../store";

const selectActivityState = (state: RootState) => state.activity;

export const selectActivities = createSelector(selectActivityState, (a) => a.activities);
export const selectActivityPagination = createSelector(selectActivityState, (a) => a.pagination);
export const selectActivityFilters = createSelector(selectActivityState, (a) => a.filters);
export const selectActivityLoading = createSelector(selectActivityState, (a) => a.loading);
