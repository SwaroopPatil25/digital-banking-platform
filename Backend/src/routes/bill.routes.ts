import { Router } from "express";
import { getCategories, payBill, getPaymentHistory } from "../controllers/bill.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { billPaymentLimiter } from "../middleware/rate-limit.middleware.js";
import { idempotencyMiddleware } from "../middleware/idempotency.middleware.js";

const router = Router();

router.get("/categories", authMiddleware, getCategories);
router.post("/pay", authMiddleware, billPaymentLimiter, idempotencyMiddleware, payBill);
router.get("/history", authMiddleware, getPaymentHistory);

export default router;
