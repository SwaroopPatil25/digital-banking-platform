import { env } from "../config/env.js";

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

const LEVEL_MAP: Record<string, LogLevel> = {
  error: LogLevel.ERROR,
  warn: LogLevel.WARN,
  info: LogLevel.INFO,
  debug: LogLevel.DEBUG,
};

const currentLevel = LEVEL_MAP[env.LOG_LEVEL] ?? LogLevel.INFO;

// Fields that must NEVER appear in logs
const SENSITIVE_KEYS = new Set([
  "password", "token", "accessToken", "refreshToken",
  "otp", "pin", "cvv", "cardNumber", "secret",
  "authorization", "cookie", "jwt",
]);

function sanitize(data: unknown): unknown {
  if (!data || typeof data !== "object") return data;
  if (Array.isArray(data)) return data.map(sanitize);

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitize(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

interface LogEntry {
  level: string;
  timestamp: string;
  message: string;
  [key: string]: unknown;
}

function formatLog(level: string, message: string, meta?: Record<string, unknown>): string {
  const entry: LogEntry = {
    level,
    timestamp: new Date().toISOString(),
    message,
    ...sanitize(meta) as object,
  };

  if (env.isProduction) {
    return JSON.stringify(entry);
  }

  const metaStr = meta ? ` ${JSON.stringify(sanitize(meta))}` : "";
  return `[${entry.timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
}

function write(level: LogLevel, levelName: string, message: string, meta?: Record<string, unknown>) {
  if (level > currentLevel) return;
  if (env.isTest) return;

  const output = formatLog(levelName, message, meta);
  if (level <= LogLevel.ERROR) {
    console.error(output);
  } else if (level <= LogLevel.WARN) {
    console.warn(output);
  } else {
    console.log(output);
  }
}

export const logger = {
  error: (message: string, meta?: Record<string, unknown>) => write(LogLevel.ERROR, "error", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => write(LogLevel.WARN, "warn", message, meta),
  info: (message: string, meta?: Record<string, unknown>) => write(LogLevel.INFO, "info", message, meta),
  debug: (message: string, meta?: Record<string, unknown>) => write(LogLevel.DEBUG, "debug", message, meta),

  // Domain-specific loggers
  auth: (event: string, meta?: Record<string, unknown>) =>
    write(LogLevel.WARN, "security", `[AUTH] ${event}`, meta),

  security: (event: string, meta?: Record<string, unknown>) =>
    write(LogLevel.WARN, "security", `[SECURITY] ${event}`, meta),

  transaction: (event: string, meta?: Record<string, unknown>) =>
    write(LogLevel.INFO, "transaction", `[TXN] ${event}`, meta),
};

export default logger;
