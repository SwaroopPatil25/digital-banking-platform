import { Router } from "express";
import { getAccount } from "../controllers/account.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, getAccount);

export default router;
