import React from "react";
import type { ReactNode } from "react";
import { render } from "@testing-library/react";
import type { RenderOptions } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import authReducer from "../../store/slices/authSlice";
import dashboardReducer from "../../store/slices/dashboardSlice";
import notificationReducer from "../../store/slices/notificationSlice";
import appReducer from "../../store/slices/appSlice";
import transactionReducer from "../../store/slices/transactionSlice";
import beneficiaryReducer from "../../store/slices/beneficiarySlice";
import activityReducer from "../../store/slices/activitySlice";
import type { RootState } from "../../store/store";

const rootReducer = combineReducers({
  auth: authReducer,
  dashboard: dashboardReducer,
  notifications: notificationReducer,
  app: appReducer,
  transactions: transactionReducer,
  beneficiaries: beneficiaryReducer,
  activity: activityReducer,
});

interface RenderWithProvidersOptions extends Omit<RenderOptions, "wrapper"> {
  preloadedState?: Partial<RootState>;
  route?: string;
}

export function renderWithProviders(
  ui: React.ReactElement,
  { preloadedState = {}, route = "/", ...options }: RenderWithProvidersOptions = {}
) {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState: preloadedState as Parameters<typeof configureStore>[0]["preloadedState"],
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>
          {children}
        </MemoryRouter>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...options }) };
}

/** Create a test store with optional preloaded state */
export function createTestStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState: preloadedState as Parameters<typeof configureStore>[0]["preloadedState"],
  });
}
