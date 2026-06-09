import { Router } from "express";
import { getTransactions, getTransactionById } from "../controllers/transaction.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, getTransactions);
router.get("/:id", authMiddleware, getTransactionById);

export default router;
