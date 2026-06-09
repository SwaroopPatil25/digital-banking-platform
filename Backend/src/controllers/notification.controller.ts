import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import * as notificationService from "../services/notification.service.js";

export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = {
      page: Math.max(1, Number(req.query.page) || 1),
      limit: Math.min(50, Math.max(1, Number(req.query.limit) || 10)),
      isRead: req.query.isRead as string | undefined,
      type: req.query.type as string | undefined,
    };

    const result = await notificationService.getNotifications(req.userId as string, query);
    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const getUnreadCount = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await notificationService.getUnreadCount(req.userId as string);
    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const markAsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const result = await notificationService.markAsRead(req.userId as string, id);
    res.status(200).json(result);
  } catch (error: any) {
    if (error.message === "Notification not found") {
      res.status(404).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await notificationService.markAllAsRead(req.userId as string);
    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const getLatestNotifications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await notificationService.getLatestNotifications(req.userId as string);
    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const result = await notificationService.deleteNotification(req.userId as string, id);
    res.status(200).json(result);
  } catch (error: any) {
    if (error.message === "Notification not found") {
      res.status(404).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};
