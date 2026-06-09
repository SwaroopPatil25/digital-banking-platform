/**
 * Application Configuration
 * Reusable constants derived from environment config.
 */
import { ENV } from "./env";

export const APP_CONFIG = {
  name: ENV.APP_NAME,
  version: ENV.APP_VERSION,
  environment: ENV.ENVIRONMENT,

  api: {
    baseUrl: ENV.API_URL,
    timeout: ENV.REQUEST_TIMEOUT,
  },

  session: {
    timeoutMinutes: ENV.SESSION_TIMEOUT_MINUTES,
    timeoutMs: ENV.SESSION_TIMEOUT_MINUTES * 60 * 1000,
  },

  features: {
    logs: ENV.ENABLE_LOGS,
    devtools: import.meta.env.DEV,
    analytics: ENV.ENABLE_ANALYTICS,
  },
} as const;
