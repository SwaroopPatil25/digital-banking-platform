const env = import.meta.env;

const getString = (
  value: string | undefined,
  fallback = ""
): string => {
  return value && value.trim() !== ""
    ? value
    : fallback;
};

const getBoolean = (
  value: string | boolean | undefined,
  fallback = false
): boolean => {
  if (value === undefined || value === "") {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return value === "true";
};

const getNumber = (
  value: string | undefined,
  fallback: number
): number => {
  const parsed = Number(value);

  return Number.isNaN(parsed)
    ? fallback
    : parsed;
};

export const ENV = {
  // API
  API_URL: getString(
    env.VITE_API_BASE_URL,
    "http://localhost:5000/api"
  ),

  REQUEST_TIMEOUT: getNumber(
    env.VITE_REQUEST_TIMEOUT,
    15000
  ),

  // App
  APP_NAME: getString(
    env.VITE_APP_NAME,
    "DigiBank"
  ),

  APP_VERSION: getString(
    env.VITE_APP_VERSION,
    "1.0.0"
  ),

  ENVIRONMENT: getString(
    env.VITE_ENVIRONMENT,
    "development"
  ),

  // Session
  SESSION_TIMEOUT_MINUTES: getNumber(
    env.VITE_SESSION_TIMEOUT_MINUTES,
    30
  ),

  // Feature Flags
  ENABLE_LOGS: getBoolean(
    env.VITE_ENABLE_LOGS,
    env.DEV
  ),

  ENABLE_DEVTOOLS: getBoolean(
    env.VITE_ENABLE_DEVTOOLS,
    env.DEV
  ),

  ENABLE_ANALYTICS: getBoolean(
    env.VITE_ENABLE_ANALYTICS,
    false
  ),

  // Derived
  IS_DEV: env.DEV,
  IS_PROD: env.PROD,
} as const;
