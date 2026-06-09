import { Router } from "express";
import { addBeneficiary, getBeneficiaries, deleteBeneficiary } from "../controllers/beneficiary.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { beneficiaryLimiter } from "../middleware/rate-limit.middleware.js";
import { idempotencyMiddleware } from "../middleware/idempotency.middleware.js";

const router = Router();

router.post("/", authMiddleware, beneficiaryLimiter, idempotencyMiddleware, addBeneficiary);
router.get("/", authMiddleware, getBeneficiaries);
router.delete("/:id", authMiddleware, deleteBeneficiary);

export default router;
