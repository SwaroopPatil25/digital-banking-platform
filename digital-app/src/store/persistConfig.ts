import storage from "./storage";

/**
 * Persist Strategy:
 * - auth: token + user → keeps user logged in on refresh
 * - dashboard: account summary only (not transactions) → instant dashboard load
 * - notifications: unreadCount only → badge persists
 *
 * NOT persisted (sensitive/volatile):
 * - transactions, activity, beneficiaries (API data, refetched as needed)
 * - filters, search, loading states (ephemeral UI)
 */

// Auth: persist everything except loading/error
export const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["token", "user", "isAuthenticated"],
};

// Dashboard: persist account summary only
export const dashboardPersistConfig = {
  key: "dashboard",
  storage,
  whitelist: ["user", "account", "lastFetched"],
};

// Notifications: persist unread count only
export const notificationPersistConfig = {
  key: "notifications",
  storage,
  whitelist: ["unreadCount"],
};

// Root persist config (used in store.ts)
export const rootPersistConfig = {
  key: "digibank",
  storage,
  whitelist: ["auth", "dashboard", "notifications"],
};
