import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import * as accountService from "../services/account.service.js";

export const getAccount = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await accountService.getAccountDetails(req.userId as string);
    res.status(200).json(result);
  } catch (error: any) {
    if (error.message === "Account not found") {
      res.status(404).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};
