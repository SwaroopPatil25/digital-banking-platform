import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import * as activityService from "../services/activity.service.js";

export const getActivityHistory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = {
      page: Math.max(1, Number(req.query.page) || 1),
      limit: Math.min(50, Math.max(1, Number(req.query.limit) || 15)),
      search: req.query.search as string | undefined,
      type: req.query.type as string | undefined,
      module: req.query.module as string | undefined,
      status: req.query.status as string | undefined,
      date: req.query.date as string | undefined,
      dateFrom: req.query.dateFrom as string | undefined,
      dateTo: req.query.dateTo as string | undefined,
    };

    const result = await activityService.getActivityHistory(req.userId as string, query);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      errorCode: "ACTIVITY_FETCH_FAILED",
      message: "Failed to fetch activity history",
      timestamp: new Date().toISOString(),
    });
  }
};
