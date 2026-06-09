import { Request, Response, NextFunction } from "express";
import { BankingError, formatErrorResponse } from "../utils/errors.js";
import logger from "../utils/logger.js";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  logger.error(err.message, {
    path: req.path,
    method: req.method,
    errorName: err.name,
    stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
  });

  if (err instanceof BankingError) {
    res.status(err.statusCode).json(formatErrorResponse(err));
    return;
  }

  res.status(500).json({
    success: false,
    errorCode: "INTERNAL_ERROR",
    message: process.env.NODE_ENV === "production" ? "An unexpected error occurred" : (err.message || "Internal Server Error"),
    timestamp: new Date().toISOString(),
  });
};
