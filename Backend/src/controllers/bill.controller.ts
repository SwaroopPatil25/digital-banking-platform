import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { payBillSchema } from "../validations/bill.validation.js";
import * as billService from "../services/bill.service.js";
import { BankingError, formatErrorResponse } from "../utils/errors.js";

export const getCategories = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = billService.getCategories();
    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const payBill = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = payBillSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        errorCode: "VALIDATION_FAILED",
        message: parsed.error.issues[0].message,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const result = await billService.payBill(req.userId as string, parsed.data);
    res.status(200).json(result);
  } catch (error: any) {
    if (error instanceof BankingError) {
      res.status(error.statusCode).json(formatErrorResponse(error));
      return;
    }
    next(error);
  }
};

export const getPaymentHistory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = {
      page: Math.max(1, Number(req.query.page) || 1),
      limit: Math.min(50, Math.max(1, Number(req.query.limit) || 10)),
      category: req.query.category as string | undefined,
      status: req.query.status as string | undefined,
      search: req.query.search as string | undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      minAmount: req.query.minAmount ? Number(req.query.minAmount) : undefined,
      maxAmount: req.query.maxAmount ? Number(req.query.maxAmount) : undefined,
    };

    const result = await billService.getPaymentHistory(req.userId as string, query);
    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};
