import { Router } from "express";
import { downloadStatement, getStatementHistory } from "../controllers/statement.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { idempotencyMiddleware } from "../middleware/idempotency.middleware.js";

const router = Router();

router.get("/download", authMiddleware, idempotencyMiddleware, downloadStatement);
router.get("/history", authMiddleware, getStatementHistory);

export default router;
