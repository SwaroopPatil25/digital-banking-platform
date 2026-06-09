import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "./storage";
import authReducer from "./slices/authSlice";
import dashboardReducer from "./slices/dashboardSlice";
import notificationReducer from "./slices/notificationSlice";
import appReducer from "./slices/appSlice";
import transactionReducer from "./slices/transactionSlice";
import beneficiaryReducer from "./slices/beneficiarySlice";
import activityReducer from "./slices/activitySlice";
import { sessionMiddleware } from "./middleware/sessionMiddleware";
import { cacheInvalidationMiddleware } from "./middleware/cacheMiddleware";
import { ENV } from "../config/env";

/**
 * Persist config — only safe global state.
 * Token/user persist keeps user logged in on refresh.
 * Dashboard account persists for instant load.
 * Notification unreadCount persists for badge.
 *
 * NOT persisted: transactions, activity, beneficiaries, filters, loading states.
 */
const persistConfig = {
  key: "digibank",
  storage,
  whitelist: ["auth", "dashboard", "notifications"],
};

const rootReducer = combineReducers({
  auth: authReducer,
  dashboard: dashboardReducer,
  notifications: notificationReducer,
  app: appReducer,
  transactions: transactionReducer,
  beneficiaries: beneficiaryReducer,
  activity: activityReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(sessionMiddleware, cacheInvalidationMiddleware),
  devTools: import.meta.env.DEV,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
