import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { statementQuerySchema } from "../validations/statement.validation.js";
import * as statementService from "../services/statement.service.js";

export const downloadStatement = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = statementQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        errorCode: "VALIDATION_FAILED",
        message: parsed.error.issues[0].message,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const { format } = parsed.data;

    if (format === "pdf") {
      const stream = await statementService.generatePDF(req.userId as string, parsed.data);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=statement_${parsed.data.fromDate}_${parsed.data.toDate}.pdf`);
      stream.pipe(res);
    } else {
      const csv = await statementService.generateCSV(req.userId as string, parsed.data);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=statement_${parsed.data.fromDate}_${parsed.data.toDate}.csv`);
      res.send(csv);
    }
  } catch (error: any) {
    if (error.message === "No transactions found") {
      res.status(404).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
};

export const getStatementHistory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = {
      page: Math.max(1, Number(req.query.page) || 1),
      limit: Math.min(50, Math.max(1, Number(req.query.limit) || 10)),
    };

    const result = await statementService.getStatementHistory(req.userId as string, query);
    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};
