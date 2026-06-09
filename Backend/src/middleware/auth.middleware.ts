import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { verifyToken } from "../utils/jwt.js";

export interface AuthRequest extends Request {
  userId?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token || token === "null" || token === "undefined") {
      res.status(401).json({ success: false, message: "Unauthorized: Invalid token format" });
      return;
    }

    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    next();
  } catch (error: any) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, message: "Session expired. Please login again." });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ success: false, message: "Invalid token. Please login again." });
      return;
    }

    res.status(401).json({ success: false, message: "Unauthorized: Authentication failed" });
  }
};
