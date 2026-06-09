import request from "supertest";
import express from "express";
import { transfer } from "../../controllers/transfer.controller";

// Mock auth middleware to inject userId
const mockAuthMiddleware = (req: any, res: any, next: any) => {
  req.userId = "507f1f77bcf86cd799439011";
  next();
};

const app = express();
app.use(express.json());
app.post("/api/transfer", mockAuthMiddleware, transfer);

jest.mock("../../services/transfer.service", () => ({
  transferMoney: jest.fn(),
}));

import * as transferService from "../../services/transfer.service";

describe("Transfer Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/transfer", () => {
    it("should return 200 on successful transfer", async () => {
      (transferService.transferMoney as jest.Mock).mockResolvedValue({
        success: true,
        message: "Transfer successful",
        data: { updatedBalance: 45000, transactionId: "txn-001", referenceNumber: "REF123" },
      });

      const res = await request(app).post("/api/transfer").send({
        beneficiaryId: "507f1f77bcf86cd799439033",
        amount: 5000,
        remarks: "Test",
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.updatedBalance).toBe(45000);
    });

    it("should return 400 for missing beneficiaryId", async () => {
      const res = await request(app).post("/api/transfer").send({
        amount: 5000,
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 for invalid amount (zero)", async () => {
      const res = await request(app).post("/api/transfer").send({
        beneficiaryId: "507f1f77bcf86cd799439033",
        amount: 0,
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 for negative amount", async () => {
      const res = await request(app).post("/api/transfer").send({
        beneficiaryId: "507f1f77bcf86cd799439033",
        amount: -100,
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 for insufficient balance", async () => {
      const { BankingError } = jest.requireActual("../../utils/errors");
      (transferService.transferMoney as jest.Mock).mockRejectedValue(
        new BankingError("INSUFFICIENT_BALANCE", "Insufficient balance", 400)
      );

      const res = await request(app).post("/api/transfer").send({
        beneficiaryId: "507f1f77bcf86cd799439033",
        amount: 999999,
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe("INSUFFICIENT_BALANCE");
    });
  });
});
