import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger.js";

/**
 * Logs security-relevant events (auth failures, suspicious access).
 * Placed AFTER route handlers — captures response status codes.
 */
export const securityAuditLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const meta = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      ip: req.ip || req.headers["x-forwarded-for"] || "unknown",
      userAgent: req.headers["user-agent"]?.substring(0, 100),
      duration,
    };

    // Auth failures
    if (res.statusCode === 401 && req.path.includes("/auth")) {
      logger.auth("Authentication failed", meta);
    }

    // Rate limit violations
    if (res.statusCode === 429) {
      logger.security("Rate limit exceeded", meta);
    }

    // Forbidden access (fraud detection, blocked beneficiary, etc.)
    if (res.statusCode === 403) {
      logger.security("Forbidden access attempt", meta);
    }

    // Server errors
    if (res.statusCode >= 500) {
      logger.error("Server error response", meta);
    }
  });

  next();
};
