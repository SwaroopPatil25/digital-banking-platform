import { Router, Request, Response } from "express";
import mongoose from "mongoose";

const router = Router();

router.get("/health", (req: Request, res: Response) => {
  const memUsage = process.memoryUsage();

  const mongoState = mongoose.connection.readyState;
  const mongoStatus: Record<number, string> = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  const healthy = mongoState === 1;

  res.status(healthy ? 200 : 503).json({
    success: healthy,
    status: healthy ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || "unknown",
    mongo: mongoStatus[mongoState] || "unknown",
    memory: {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heap: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    },
    version: process.env.npm_package_version || "1.0.0",
  });
});

// Lightweight liveness probe (for Docker HEALTHCHECK / k8s)
router.get("/health/live", (_req: Request, res: Response) => {
  res.status(200).send("OK");
});

// Readiness probe (checks if ready to accept traffic)
router.get("/health/ready", (_req: Request, res: Response) => {
  if (mongoose.connection.readyState === 1) {
    res.status(200).json({ ready: true });
  } else {
    res.status(503).json({ ready: false, reason: "MongoDB not connected" });
  }
});

export default router;
