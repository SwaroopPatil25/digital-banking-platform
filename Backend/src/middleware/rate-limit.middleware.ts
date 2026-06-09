import rateLimit from "express-rate-limit";
import { rateLimitConfig } from "../config/app.config.js";

export const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { success: false, errorCode: "RATE_LIMIT_EXCEEDED", message: "Too many login attempts. Please try again after 1 minute.", timestamp: new Date().toISOString() },
  standardHeaders: true,
  legacyHeaders: false,
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { success: false, errorCode: "RATE_LIMIT_EXCEEDED", message: "Too many registration attempts. Please try again later.", timestamp: new Date().toISOString() },
  standardHeaders: true,
  legacyHeaders: false,
});

export const transferLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, errorCode: "RATE_LIMIT_EXCEEDED", message: "Too many transfer requests. Please try again after 1 minute.", timestamp: new Date().toISOString() },
  standardHeaders: true,
  legacyHeaders: false,
});

export const billPaymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, errorCode: "RATE_LIMIT_EXCEEDED", message: "Too many bill payment requests. Please try again after 1 minute.", timestamp: new Date().toISOString() },
  standardHeaders: true,
  legacyHeaders: false,
});

export const beneficiaryLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, errorCode: "RATE_LIMIT_EXCEEDED", message: "Too many requests. Please try again later.", timestamp: new Date().toISOString() },
  standardHeaders: true,
  legacyHeaders: false,
});

export const generalLimiter = rateLimit({
  windowMs: rateLimitConfig.windowMs,
  max: rateLimitConfig.max,
  message: { success: false, errorCode: "RATE_LIMIT_EXCEEDED", message: "Too many requests. Please slow down.", timestamp: new Date().toISOString() },
  standardHeaders: true,
  legacyHeaders: false,
});
