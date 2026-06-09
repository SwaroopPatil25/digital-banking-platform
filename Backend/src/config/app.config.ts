import { env } from "./env.js";

export const jwtConfig = {
  secret: env.JWT_SECRET,
  expiresIn: env.JWT_EXPIRES_IN,
};

export const corsConfig = {
  origin: env.isProduction
    ? env.CORS_ORIGIN.split(",").map((o) => o.trim())
    : [env.CORS_ORIGIN, "http://localhost:5173", "http://localhost:3000"],
  credentials: true,
  optionsSuccessStatus: 200,
};

export const rateLimitConfig = {
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
};

export const securityConfig = {
  bcryptSaltRounds: env.BCRYPT_SALT_ROUNDS,
  sessionTimeoutMinutes: env.SESSION_TIMEOUT_MINUTES,
  cookieSecret: env.COOKIE_SECRET,
};

export const serverConfig = {
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  clientUrl: env.CLIENT_URL,
  apiBaseUrl: env.API_BASE_URL,
};

export const loggingConfig = {
  level: env.LOG_LEVEL,
  morganFormat: env.isProduction ? "combined" : "dev",
};
