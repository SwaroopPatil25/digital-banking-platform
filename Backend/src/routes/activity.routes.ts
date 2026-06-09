import { Router } from "express";
import { getActivityHistory } from "../controllers/activity.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, getActivityHistory);

export default router;
