import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import * as dashboardService from "../services/dashboard.service.js";

export const getDashboard = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await dashboardService.getDashboardData(req.userId as string);
    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};
