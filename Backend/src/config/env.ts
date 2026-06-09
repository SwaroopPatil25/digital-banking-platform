import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../..");

// Load environment-specific file
const NODE_ENV = process.env.NODE_ENV || "development";
dotenv.config({ path: path.join(rootDir, `.env.${NODE_ENV}`) });
// Fallback to .env
dotenv.config({ path: path.join(rootDir, ".env") });

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    console.error(`\n❌ FATAL: Missing required environment variable: ${key}`);
    console.error(`   Set it in .env.${NODE_ENV} or .env\n`);
    process.exit(1);
  }
  return value;
}

function optional(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

function optionalInt(key: string, fallback: number): number {
  const val = process.env[key];
  return val ? parseInt(val, 10) : fallback;
}

export const env = {
  NODE_ENV,
  isProduction: NODE_ENV === "production",
  isDevelopment: NODE_ENV === "development",
  isTest: NODE_ENV === "test",

  PORT: optionalInt("PORT", 5000),
  MONGO_URI: required("MONGO_URI"),
  JWT_SECRET: required("JWT_SECRET"),
  JWT_EXPIRES_IN: optional("JWT_EXPIRES_IN", "7d"),

  CLIENT_URL: optional("CLIENT_URL", "http://localhost:5173"),
  API_BASE_URL: optional("API_BASE_URL", "http://localhost:5000"),

  LOG_LEVEL: optional("LOG_LEVEL", "debug"),
  CORS_ORIGIN: optional("CORS_ORIGIN", "http://localhost:5173"),

  RATE_LIMIT_WINDOW_MS: optionalInt("RATE_LIMIT_WINDOW_MS", 60000),
  RATE_LIMIT_MAX_REQUESTS: optionalInt("RATE_LIMIT_MAX_REQUESTS", 60),

  COOKIE_SECRET: optional("COOKIE_SECRET", "dev-cookie-secret"),
  BCRYPT_SALT_ROUNDS: optionalInt("BCRYPT_SALT_ROUNDS", 10),
  SESSION_TIMEOUT_MINUTES: optionalInt("SESSION_TIMEOUT_MINUTES", 30),
} as const;

export default env;
