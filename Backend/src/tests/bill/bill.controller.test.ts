import request from "supertest";
import express from "express";
import { payBill, getCategories, getPaymentHistory } from "../../controllers/bill.controller";

const mockAuthMiddleware = (req: any, res: any, next: any) => {
  req.userId = "507f1f77bcf86cd799439011";
  next();
};

const app = express();
app.use(express.json());
app.get("/api/bills/categories", mockAuthMiddleware, getCategories);
app.post("/api/bills/pay", mockAuthMiddleware, payBill);
app.get("/api/bills/history", mockAuthMiddleware, getPaymentHistory);

jest.mock("../../services/bill.service", () => ({
  getCategories: jest.fn().mockReturnValue({
    success: true,
    categories: [{ label: "Electricity", value: "electricity" }, { label: "Mobile Recharge", value: "mobile" }],
  }),
  payBill: jest.fn(),
  getPaymentHistory: jest.fn(),
}));

import * as billService from "../../services/bill.service";

describe("Bill Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/bills/categories", () => {
    it("should return bill categories", async () => {
      const res = await request(app).get("/api/bills/categories");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.categories.length).toBeGreaterThan(0);
    });

    it("should call next on error", async () => {
      (billService.getCategories as jest.Mock).mockImplementation(() => { throw new Error("fail"); });

      const res = await request(app).get("/api/bills/categories");

      expect(res.status).toBe(500);
    });
  });

  describe("POST /api/bills/pay", () => {
    it("should return 200 on successful payment", async () => {
      (billService.payBill as jest.Mock).mockResolvedValue({
        success: true, message: "Bill payment successful", data: { updatedBalance: 48500 },
      });

      const res = await request(app).post("/api/bills/pay").send({
        category: "electricity", billerName: "City Power", consumerNumber: "CONS123", amount: 1500,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 400 for invalid category", async () => {
      const res = await request(app).post("/api/bills/pay").send({
        category: "invalid_category", billerName: "Test", consumerNumber: "123", amount: 100,
      });
      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe("VALIDATION_FAILED");
    });

    it("should return 400 for missing required fields", async () => {
      const res = await request(app).post("/api/bills/pay").send({ category: "electricity" });
      expect(res.status).toBe(400);
    });

    it("should return 400 for zero amount", async () => {
      const res = await request(app).post("/api/bills/pay").send({
        category: "electricity", billerName: "City Power", consumerNumber: "CONS123", amount: 0,
      });
      expect(res.status).toBe(400);
    });

    it("should handle BankingError from service", async () => {
      const { BankingError } = jest.requireActual("../../utils/errors");
      (billService.payBill as jest.Mock).mockRejectedValue(new BankingError("INSUFFICIENT_BALANCE", "Insufficient balance", 400));

      const res = await request(app).post("/api/bills/pay").send({
        category: "electricity", billerName: "City Power", consumerNumber: "CONS123", amount: 99999,
      });

      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe("INSUFFICIENT_BALANCE");
    });

    it("should call next for non-BankingError", async () => {
      (billService.payBill as jest.Mock).mockRejectedValue(new Error("DB error"));

      const res = await request(app).post("/api/bills/pay").send({
        category: "electricity", billerName: "City Power", consumerNumber: "CONS123", amount: 100,
      });

      expect(res.status).toBe(500);
    });
  });

  describe("GET /api/bills/history", () => {
    it("should return payment history", async () => {
      (billService.getPaymentHistory as jest.Mock).mockResolvedValue({
        success: true, data: [{ billerName: "Power Corp", amount: 1500 }], pagination: { page: 1, total: 1 },
      });

      const res = await request(app).get("/api/bills/history");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it("should pass query params to service", async () => {
      (billService.getPaymentHistory as jest.Mock).mockResolvedValue({ success: true, data: [], pagination: {} });

      await request(app).get("/api/bills/history?page=2&limit=5&category=electricity&status=SUCCESS&search=power&startDate=2024-01-01&endDate=2024-12-31&minAmount=100&maxAmount=5000");

      expect(billService.getPaymentHistory).toHaveBeenCalledWith("507f1f77bcf86cd799439011", expect.objectContaining({
        page: 2, limit: 5, category: "electricity", status: "SUCCESS", search: "power",
      }));
    });

    it("should use defaults for missing query params", async () => {
      (billService.getPaymentHistory as jest.Mock).mockResolvedValue({ success: true, data: [], pagination: {} });

      await request(app).get("/api/bills/history");

      expect(billService.getPaymentHistory).toHaveBeenCalledWith("507f1f77bcf86cd799439011", expect.objectContaining({
        page: 1, limit: 10,
      }));
    });

    it("should call next on error", async () => {
      (billService.getPaymentHistory as jest.Mock).mockRejectedValue(new Error("fail"));

      const res = await request(app).get("/api/bills/history");

      expect(res.status).toBe(500);
    });
  });
});
