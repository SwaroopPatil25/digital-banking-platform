import { TEST_USER_ID, mockAccount } from "../utils/helpers";

const mockAccountFindOne = jest.fn();
const mockBillPaymentCreate = jest.fn();
const mockBillPaymentFind = jest.fn();
const mockBillPaymentCountDocuments = jest.fn();

jest.mock("../../models/account.model", () => ({
  __esModule: true,
  default: { findOne: (...args: any[]) => mockAccountFindOne(...args) },
}));
jest.mock("../../models/transaction.model", () => ({
  __esModule: true,
  default: { create: jest.fn() },
}));
jest.mock("../../models/bill-payment.model", () => ({
  __esModule: true,
  default: {
    create: (...args: any[]) => mockBillPaymentCreate(...args),
    find: (...args: any[]) => mockBillPaymentFind(...args),
    countDocuments: (...args: any[]) => mockBillPaymentCountDocuments(...args),
  },
  BILL_CATEGORIES: ["electricity", "mobile", "dth", "broadband", "water", "gas", "creditCard", "loanEmi"],
}));
jest.mock("../../utils/transaction.helper", () => ({
  createLifecycleTransaction: jest.fn().mockResolvedValue({ _id: "txn-bill-001", referenceNumber: "BILL-REF-001" }),
  transitionToProcessing: jest.fn().mockResolvedValue(true),
  transitionToSuccess: jest.fn().mockResolvedValue(true),
  transitionToFailed: jest.fn().mockResolvedValue(true),
  createTransaction: jest.fn().mockResolvedValue(true),
}));
jest.mock("../../services/fraud.service", () => ({
  checkTransferLimits: jest.fn().mockResolvedValue(true),
  updateDailyLimits: jest.fn().mockResolvedValue(true),
  assessRisk: jest.fn().mockResolvedValue("LOW"),
}));
jest.mock("../../services/notification-event.service", () => ({
  notifyBillPayment: jest.fn(),
}));
jest.mock("../../services/audit.service", () => ({
  auditBillPayment: jest.fn(),
}));
jest.mock("../../utils/pagination", () => ({
  buildPaginationResult: jest.fn().mockReturnValue({ page: 1, limit: 10, total: 0, totalPages: 0 }),
  getSkip: jest.fn().mockReturnValue(0),
}));

import * as billService from "../../services/bill.service";

describe("Bill Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCategories", () => {
    it("should return bill categories", () => {
      const result = billService.getCategories();
      expect(result.success).toBe(true);
      expect(result.categories).toBeDefined();
      expect(result.categories.length).toBeGreaterThan(0);
    });
  });

  describe("payBill", () => {
    it("should pay bill successfully", async () => {
      mockAccountFindOne.mockResolvedValue({ ...mockAccount, balance: 50000, save: jest.fn().mockResolvedValue(true) });
      mockBillPaymentCreate.mockResolvedValue({ _id: "bill-pay-001", category: "electricity", amount: 1500 });

      const result = await billService.payBill(TEST_USER_ID, {
        category: "electricity", billerName: "City Power Corp", consumerNumber: "CONS123456", amount: 1500,
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe("Bill payment successful");
      expect(result.data.updatedBalance).toBe(48500);
    });

    it("should fail with insufficient balance", async () => {
      mockAccountFindOne.mockResolvedValue({ ...mockAccount, balance: 100, save: jest.fn().mockResolvedValue(true) });

      await expect(
        billService.payBill(TEST_USER_ID, { category: "electricity", billerName: "City Power Corp", consumerNumber: "CONS123456", amount: 5000 })
      ).rejects.toThrow("Insufficient balance");
    });

    it("should fail when account not found", async () => {
      mockAccountFindOne.mockResolvedValue(null);

      await expect(
        billService.payBill(TEST_USER_ID, { category: "mobile", billerName: "Telecom Co", consumerNumber: "MOB123", amount: 500 })
      ).rejects.toThrow("Account not found");
    });

    it("should fail when account.save throws error", async () => {
      mockAccountFindOne.mockResolvedValue({
        ...mockAccount, balance: 50000,
        save: jest.fn().mockRejectedValue(new Error("DB write error")),
      });

      await expect(
        billService.payBill(TEST_USER_ID, { category: "electricity", billerName: "City Power", consumerNumber: "C123", amount: 1000 })
      ).rejects.toThrow("Bill payment failed");
    });
  });

  describe("getPaymentHistory", () => {
    it("should return payment history with pagination", async () => {
      const mockPayments = [{ category: "electricity", billerName: "Power Corp", amount: 1500, status: "SUCCESS" }];
      mockBillPaymentFind.mockReturnValue({
        sort: jest.fn().mockReturnThis(), skip: jest.fn().mockReturnThis(), limit: jest.fn().mockReturnThis(), select: jest.fn().mockResolvedValue(mockPayments),
      });
      mockBillPaymentCountDocuments.mockResolvedValue(1);

      const result = await billService.getPaymentHistory(TEST_USER_ID, { page: 1, limit: 10 });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });

    it("should apply category and status filters", async () => {
      mockBillPaymentFind.mockReturnValue({
        sort: jest.fn().mockReturnThis(), skip: jest.fn().mockReturnThis(), limit: jest.fn().mockReturnThis(), select: jest.fn().mockResolvedValue([]),
      });
      mockBillPaymentCountDocuments.mockResolvedValue(0);

      const result = await billService.getPaymentHistory(TEST_USER_ID, { page: 1, limit: 10, category: "electricity", status: "SUCCESS" });

      expect(result.filtersApplied.category).toBe("electricity");
      expect(result.filtersApplied.status).toBe("SUCCESS");
    });

    it("should apply search filter", async () => {
      mockBillPaymentFind.mockReturnValue({
        sort: jest.fn().mockReturnThis(), skip: jest.fn().mockReturnThis(), limit: jest.fn().mockReturnThis(), select: jest.fn().mockResolvedValue([]),
      });
      mockBillPaymentCountDocuments.mockResolvedValue(0);

      const result = await billService.getPaymentHistory(TEST_USER_ID, { page: 1, limit: 10, search: "power" });

      expect(result.filtersApplied.search).toBe("power");
    });

    it("should apply date range filter", async () => {
      mockBillPaymentFind.mockReturnValue({
        sort: jest.fn().mockReturnThis(), skip: jest.fn().mockReturnThis(), limit: jest.fn().mockReturnThis(), select: jest.fn().mockResolvedValue([]),
      });
      mockBillPaymentCountDocuments.mockResolvedValue(0);

      const result = await billService.getPaymentHistory(TEST_USER_ID, { page: 1, limit: 10, startDate: "2024-01-01", endDate: "2024-12-31" });

      expect(result.filtersApplied.startDate).toBe("2024-01-01");
      expect(result.filtersApplied.endDate).toBe("2024-12-31");
    });

    it("should apply amount range filter", async () => {
      mockBillPaymentFind.mockReturnValue({
        sort: jest.fn().mockReturnThis(), skip: jest.fn().mockReturnThis(), limit: jest.fn().mockReturnThis(), select: jest.fn().mockResolvedValue([]),
      });
      mockBillPaymentCountDocuments.mockResolvedValue(0);

      const result = await billService.getPaymentHistory(TEST_USER_ID, { page: 1, limit: 10, minAmount: 100, maxAmount: 5000 });

      expect(result.success).toBe(true);
    });

    it("should apply startDate only filter", async () => {
      mockBillPaymentFind.mockReturnValue({
        sort: jest.fn().mockReturnThis(), skip: jest.fn().mockReturnThis(), limit: jest.fn().mockReturnThis(), select: jest.fn().mockResolvedValue([]),
      });
      mockBillPaymentCountDocuments.mockResolvedValue(0);

      const result = await billService.getPaymentHistory(TEST_USER_ID, { page: 1, limit: 10, startDate: "2024-01-01" });

      expect(result.success).toBe(true);
    });
  });
});
