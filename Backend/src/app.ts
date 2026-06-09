import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { corsConfig, loggingConfig } from "./config/app.config.js";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import beneficiaryRoutes from "./routes/beneficiary.routes.js";
import transferRoutes from "./routes/transfer.routes.js";
import accountRoutes from "./routes/account.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import statementRoutes from "./routes/statement.routes.js";
import billRoutes from "./routes/bill.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import activityRoutes from "./routes/activity.routes.js";
import healthRoutes from "./routes/health.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { generalLimiter } from "./middleware/rate-limit.middleware.js";
import { securityAuditLogger } from "./middleware/security-audit.middleware.js";

const app = express();

// Trust proxy (behind Nginx/load balancer)
app.set("trust proxy", 1);

// Disable X-Powered-By (additional to helmet)
app.disable("x-powered-by");

// Security headers (BFSI hardened)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "same-origin" },
  hsts: { maxAge: 63072000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
}));

// Compression
app.use(compression());

// Logging
if (!env.isTest) {
  app.use(morgan(loggingConfig.morganFormat));
}

// CORS
app.use(cors(corsConfig));

// Body parsing (with size limit to prevent payload bombs)
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));

// Security audit logging
if (!env.isTest) {
  app.use(securityAuditLogger);
}

// Health check (no rate limit, no auth — before rate limiter)
app.use("/api", healthRoutes);

// Rate limiting
app.use("/api/", generalLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/beneficiaries", beneficiaryRoutes);
app.use("/api/transfer", transferRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/statement", statementRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/activity", activityRoutes);

// Error handler
app.use(errorHandler);

export default app;
