import { createSlice } from "@reduxjs/toolkit";

interface AppState {
  globalLoading: boolean;
  globalError: string | null;
  sessionTimeoutModal: boolean;
}

const initialState: AppState = {
  globalLoading: false,
  globalError: null,
  sessionTimeoutModal: false,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setGlobalLoading(state, action: { payload: boolean }) {
      state.globalLoading = action.payload;
    },
    setGlobalError(state, action: { payload: string | null }) {
      state.globalError = action.payload;
    },
    clearGlobalError(state) {
      state.globalError = null;
    },
    showSessionTimeout(state) {
      state.sessionTimeoutModal = true;
    },
    hideSessionTimeout(state) {
      state.sessionTimeoutModal = false;
    },
  },
});

export const {
  setGlobalLoading,
  setGlobalError,
  clearGlobalError,
  showSessionTimeout,
  hideSessionTimeout,
} = appSlice.actions;
export default appSlice.reducer;
