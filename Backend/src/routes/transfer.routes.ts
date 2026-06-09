import { Router } from "express";
import { transfer } from "../controllers/transfer.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { transferLimiter } from "../middleware/rate-limit.middleware.js";
import { idempotencyMiddleware } from "../middleware/idempotency.middleware.js";

const router = Router();

router.post("/", authMiddleware, transferLimiter, idempotencyMiddleware, transfer);

export default router;
