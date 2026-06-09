import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { transferSchema } from "../validations/transfer.validation.js";
import * as transferService from "../services/transfer.service.js";
import { BankingError, formatErrorResponse } from "../utils/errors.js";

export const transfer = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = transferSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        errorCode: "VALIDATION_FAILED",
        message: parsed.error.issues[0].message,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const result = await transferService.transferMoney(req.userId as string, parsed.data);
    res.status(200).json(result);
  } catch (error: any) {
    if (error instanceof BankingError) {
      res.status(error.statusCode).json(formatErrorResponse(error));
      return;
    }
    next(error);
  }
};
