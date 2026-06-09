import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { beneficiarySchema } from "../validations/beneficiary.validation.js";
import * as beneficiaryService from "../services/beneficiary.service.js";

export const addBeneficiary = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = beneficiarySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: parsed.error.issues[0].message });
      return;
    }

    const result = await beneficiaryService.addBeneficiary(req.userId as string, parsed.data);
    res.status(201).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const getBeneficiaries = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = {
      page: Math.max(1, Number(req.query.page) || 1),
      limit: Math.min(50, Math.max(1, Number(req.query.limit) || 10)),
      search: req.query.search as string | undefined,
      isFavorite: req.query.isFavorite as string | undefined,
    };

    const result = await beneficiaryService.getBeneficiaries(req.userId as string, query);
    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const deleteBeneficiary = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    if (!id) {
      res.status(400).json({ success: false, message: "Beneficiary ID is required" });
      return;
    }

    const result = await beneficiaryService.deleteBeneficiary(req.userId as string, id);
    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};
