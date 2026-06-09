import { Request, Response, NextFunction } from "express";
import { registerSchema, loginSchema } from "../validations/auth.validation.js";
import { updateProfileSchema } from "../validations/profile.validation.js";
import * as authService from "../services/auth.service.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { BankingError, formatErrorResponse } from "../utils/errors.js";

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        errorCode: "VALIDATION_FAILED",
        message: parsed.error.issues[0].message,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const result = await authService.registerUser(parsed.data);
    res.status(201).json(result);
  } catch (error: any) {
    if (error instanceof BankingError) {
      res.status(error.statusCode).json(formatErrorResponse(error));
      return;
    }
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        errorCode: "VALIDATION_FAILED",
        message: parsed.error.issues[0].message,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const ipAddress = req.ip || req.headers["x-forwarded-for"] as string || "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";

    const result = await authService.loginUser(parsed.data, ipAddress, userAgent);
    res.status(200).json(result);
  } catch (error: any) {
    if (error instanceof BankingError) {
      res.status(error.statusCode).json(formatErrorResponse(error));
      return;
    }
    next(error);
  }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ipAddress = req.ip || req.headers["x-forwarded-for"] as string || "unknown";
    const result = await authService.logoutUser(req.userId as string, ipAddress);
    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await authService.getUserProfile(req.userId as string);
    res.status(200).json({ success: true, user });
  } catch (error: any) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        errorCode: "VALIDATION_FAILED",
        message: parsed.error.issues[0].message,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const result = await authService.updateUserProfile(req.userId as string, parsed.data);
    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};
