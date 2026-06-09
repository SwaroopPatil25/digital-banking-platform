import request from "supertest";
import express from "express";
import { addBeneficiary, getBeneficiaries, deleteBeneficiary } from "../../controllers/beneficiary.controller";

const mockAuthMiddleware = (req: any, res: any, next: any) => {
  req.userId = "507f1f77bcf86cd799439011";
  next();
};

const app = express();
app.use(express.json());
app.post("/api/beneficiaries", mockAuthMiddleware, addBeneficiary);
app.get("/api/beneficiaries", mockAuthMiddleware, getBeneficiaries);
app.delete("/api/beneficiaries/:id", mockAuthMiddleware, deleteBeneficiary);

jest.mock("../../services/beneficiary.service", () => ({
  addBeneficiary: jest.fn(),
  getBeneficiaries: jest.fn(),
  deleteBeneficiary: jest.fn(),
}));

import * as beneficiaryService from "../../services/beneficiary.service";

describe("Beneficiary Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/beneficiaries", () => {
    it("should return 201 on success", async () => {
      (beneficiaryService.addBeneficiary as jest.Mock).mockResolvedValue({
        success: true,
        message: "Beneficiary added successfully.",
      });

      const res = await request(app).post("/api/beneficiaries").send({
        beneficiaryName: "Jane Doe",
        accountNumber: "11223344556",
        bankName: "SBI",
        ifscCode: "SBIN0001234",
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it("should return 400 for missing name", async () => {
      const res = await request(app).post("/api/beneficiaries").send({
        accountNumber: "11223344556",
        bankName: "SBI",
        ifscCode: "SBIN0001234",
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 for invalid IFSC", async () => {
      const res = await request(app).post("/api/beneficiaries").send({
        beneficiaryName: "Jane Doe",
        accountNumber: "11223344556",
        bankName: "SBI",
        ifscCode: "INVALID",
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 400 for short account number", async () => {
      const res = await request(app).post("/api/beneficiaries").send({
        beneficiaryName: "Jane Doe",
        accountNumber: "123",
        bankName: "SBI",
        ifscCode: "SBIN0001234",
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/beneficiaries", () => {
    it("should return beneficiary list", async () => {
      (beneficiaryService.getBeneficiaries as jest.Mock).mockResolvedValue({
        success: true,
        data: [{ beneficiaryName: "Jane", accountNumber: "1122334455" }],
        pagination: { page: 1, limit: 10, total: 1 },
      });

      const res = await request(app).get("/api/beneficiaries");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe("DELETE /api/beneficiaries/:id", () => {
    it("should delete beneficiary successfully", async () => {
      (beneficiaryService.deleteBeneficiary as jest.Mock).mockResolvedValue({
        success: true,
        message: "Beneficiary removed successfully",
      });

      const res = await request(app).delete("/api/beneficiaries/507f1f77bcf86cd799439033");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
