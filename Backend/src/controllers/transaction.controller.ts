import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { transactionQuerySchema } from "../validations/transaction.validation.js";
import * as transactionService from "../services/transaction.service.js";

export const getTransactions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = transactionQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: parsed.error.issues[0].message });
      return;
    }

    const result = await transactionService.getTransactions(req.userId as string, parsed.data);
    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const getTransactionById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    if (!id) {
      res.status(400).json({ success: false, message: "Transaction ID is required" });
      return;
    }

    const result = await transactionService.getTransactionById(req.userId as string, id);
    res.status(200).json(result);
  } catch (error: any) {
    if (error.message === "Transaction not found") {
      res.status(404).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};
