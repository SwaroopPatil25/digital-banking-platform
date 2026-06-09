import { describe, it, expect } from "@jest/globals";
import appReducer, {
  setGlobalLoading,
  setGlobalError,
  clearGlobalError,
  showSessionTimeout,
  hideSessionTimeout,
} from "../../store/slices/appSlice";

describe("appSlice", () => {
  const initialState = {
    globalLoading: false,
    globalError: null,
    sessionTimeoutModal: false,
  };

  it("should return initial state", () => {
    expect(appReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  it("should set global loading", () => {
    const result = appReducer(initialState, setGlobalLoading(true));
    expect(result.globalLoading).toBe(true);
  });

  it("should set global error", () => {
    const result = appReducer(initialState, setGlobalError("Something went wrong"));
    expect(result.globalError).toBe("Something went wrong");
  });

  it("should clear global error", () => {
    const errorState = { ...initialState, globalError: "Error" };
    const result = appReducer(errorState, clearGlobalError());
    expect(result.globalError).toBeNull();
  });

  it("should show session timeout", () => {
    const result = appReducer(initialState, showSessionTimeout());
    expect(result.sessionTimeoutModal).toBe(true);
  });

  it("should hide session timeout", () => {
    const shown = { ...initialState, sessionTimeoutModal: true };
    const result = appReducer(shown, hideSessionTimeout());
    expect(result.sessionTimeoutModal).toBe(false);
  });
});
