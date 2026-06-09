import { Response, NextFunction } from "express";
import crypto from "crypto";
import { AuthRequest } from "./auth.middleware.js";
import IdempotencyKey from "../models/idempotency-key.model.js";

const IDEMPOTENCY_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const idempotencyMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const idempotencyKey = req.headers["x-idempotency-key"] as string;

  if (!idempotencyKey) {
    next();
    return;
  }

  const userId = req.userId as string;
  const requestHash = crypto.createHash("sha256").update(JSON.stringify(req.body)).digest("hex");

  try {
    const existing = await IdempotencyKey.findOne({ key: idempotencyKey, userId });

    if (existing) {
      // Return cached response
      res.status(existing.statusCode).json({
        ...existing.response,
        _idempotent: true,
      });
      return;
    }

    // Store original res.json to intercept response
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      // Save response for future duplicate requests (non-blocking)
      IdempotencyKey.create({
        key: idempotencyKey,
        userId,
        requestHash,
        response: body,
        statusCode: res.statusCode,
        expiresAt: new Date(Date.now() + IDEMPOTENCY_TTL_MS),
      }).catch((err) => console.error("Idempotency save failed:", err.message));

      return originalJson(body);
    };

    next();
  } catch (error) {
    next();
  }
};
