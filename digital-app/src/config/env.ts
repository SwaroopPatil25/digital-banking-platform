/**
 * Centralized Environment Configuration
 * Single source of truth — never use import.meta.env directly elsewhere.
 */

const getEnvVar = (key: string, fallback?: string): string => {
  const value = import.meta.env[key] as string | undefined;
  if (value !== undefined && value !== "") return value;
  if (fallback !== undefined) return fallback;
  console.warn(`[ENV] Missing variable: ${key}`);
  return "";
};

const getBoolEnv = (key: string, fallback: boolean): boolean => {
  const value = import.meta.env[key] as string | undefined;
  if (value === undefined || value === "") return fallback;
  return value === "true";
};

const getNumEnv = (key: string, fallback: number): number => {
  const value = import.meta.env[key] as string | undefined;
  if (value === undefined || value === "") return fallback;
  const parsed = Number(value);
  return isNaN(parsed) ? fallback : parsed;
};

export const ENV = {
  // API
  API_URL: getEnvVar("VITE_API_BASE_URL", "http://localhost:5000/api"),
  REQUEST_TIMEOUT: getNumEnv("VITE_REQUEST_TIMEOUT", 15000),

  // App
  APP_NAME: getEnvVar("VITE_APP_NAME", "DigiBank"),
  APP_VERSION: getEnvVar("VITE_APP_VERSION", "1.0.0"),
  ENVIRONMENT: getEnvVar("VITE_ENVIRONMENT", "development"),

  // Session
  SESSION_TIMEOUT_MINUTES: getNumEnv("VITE_SESSION_TIMEOUT_MINUTES", 30),

  // Feature flags
  ENABLE_LOGS: getBoolEnv("VITE_ENABLE_LOGS", import.meta.env.DEV),
  ENABLE_DEVTOOLS: getBoolEnv("VITE_ENABLE_DEVTOOLS", import.meta.env.DEV),
  ENABLE_ANALYTICS: getBoolEnv("VITE_ENABLE_ANALYTICS", false),

  // Derived
  IS_DEV: import.meta.env.DEV as boolean,
  IS_PROD: import.meta.env.PROD as boolean,
} as const;
