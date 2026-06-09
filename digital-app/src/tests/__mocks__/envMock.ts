export const ENV = {
  API_URL: "http://localhost:5000/api",
  REQUEST_TIMEOUT: 5000,
  APP_NAME: "DigiBank",
  APP_VERSION: "1.0.0",
  ENVIRONMENT: "test",
  SESSION_TIMEOUT_MINUTES: 30,
  ENABLE_LOGS: false,
  ENABLE_DEVTOOLS: false,
  ENABLE_ANALYTICS: false,
  IS_DEV: true,
  IS_PROD: false,
} as const;
