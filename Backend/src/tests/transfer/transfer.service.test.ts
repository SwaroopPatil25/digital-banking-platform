import { TEST_USER_ID, TEST_BENEFICIARY_ID, mockAccount, mockBeneficiary } from "../utils/helpers";

const mockAccountFindOne = jest.fn();
const mockBeneficiaryFindOne = jest.fn();

jest.mock("../../models/account.model", () => ({
  __esModule: true,
  default: { findOne: (...args: any[]) => mockAccountFindOne(...args) },
}));
jest.mock("../../models/beneficiary.model", () => ({
  __esModule: true,
  default: { findOne: (...args: any[]) => mockBeneficiaryFindOne(...args) },
}));
jest.mock("../../models/transaction.model", () => ({
  __esModule: true,
  default: { create: jest.fn() },
}));
jest.mock("../../utils/transaction.helper", () => ({
  createLifecycleTransaction: jest.fn().mockResolvedValue({ _id: "txn-001", referenceNumber: "REF123456" }),
  transitionToProcessing: jest.fn().mockResolvedValue(true),
  transitionToSuccess: jest.fn().mockResolvedValue(true),
  transitionToFailed: jest.fn().mockResolvedValue(true),
  createTransaction: jest.fn().mockResolvedValue(true),
}));
jest.mock("../../services/fraud.service", () => ({
  checkTransferLimits: jest.fn().mockResolvedValue(true),
  updateDailyLimits: jest.fn().mockResolvedValue(true),
  assessRisk: jest.fn().mockResolvedValue("LOW"),
  checkBeneficiaryCoolingPeriod: jest.fn().mockReturnValue(true),
}));
jest.mock("../../services/notification-event.service", () => ({
  notifyTransferSuccess: jest.fn(),
  notifyTransferFailed: jest.fn(),
}));
jest.mock("../../services/audit.service", () => ({
  auditTransferInitiated: jest.fn(),
  auditTransferSuccess: jest.fn(),
  auditTransferFailed: jest.fn(),
}));

import * as transferService from "../../services/transfer.service";
import { checkBeneficiaryCoolingPeriod } from "../../services/fraud.service";

describe("Transfer Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("transferMoney", () => {
    it("should transfer successfully with valid data", async () => {
      mockBeneficiaryFindOne.mockResolvedValue({ ...mockBeneficiary });
      mockAccountFindOne.mockResolvedValue({ ...mockAccount, balance: 50000, save: jest.fn().mockResolvedValue(true) });

      const result = await transferService.transferMoney(TEST_USER_ID, {
        beneficiaryId: TEST_BENEFICIARY_ID, amount: 5000, remarks: "Test transfer",
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe("Transfer successful");
      expect(result.data.transactionId).toBe("txn-001");
      expect(result.data.updatedBalance).toBe(45000);
    });

    it("should fail with insufficient balance", async () => {
      mockBeneficiaryFindOne.mockResolvedValue({ ...mockBeneficiary });
      mockAccountFindOne.mockResolvedValue({ ...mockAccount, balance: 100, save: jest.fn().mockResolvedValue(true) });

      await expect(
        transferService.transferMoney(TEST_USER_ID, { beneficiaryId: TEST_BENEFICIARY_ID, amount: 5000 })
      ).rejects.toThrow("Insufficient balance");
    });

    it("should fail when beneficiary not found", async () => {
      mockBeneficiaryFindOne.mockResolvedValue(null);

      await expect(
        transferService.transferMoney(TEST_USER_ID, { beneficiaryId: "invalid-id", amount: 1000 })
      ).rejects.toThrow("Beneficiary not found");
    });

    it("should fail when account not found", async () => {
      mockBeneficiaryFindOne.mockResolvedValue({ ...mockBeneficiary });
      mockAccountFindOne.mockResolvedValue(null);

      await expect(
        transferService.transferMoney(TEST_USER_ID, { beneficiaryId: TEST_BENEFICIARY_ID, amount: 1000 })
      ).rejects.toThrow("Account not found");
    });

    it("should fail when beneficiary is blocked", async () => {
      mockBeneficiaryFindOne.mockResolvedValue({ ...mockBeneficiary, beneficiaryStatus: "BLOCKED" });

      await expect(
        transferService.transferMoney(TEST_USER_ID, { beneficiaryId: TEST_BENEFICIARY_ID, amount: 1000 })
      ).rejects.toThrow("Beneficiary is blocked");
    });

    it("should auto-activate PENDING_APPROVAL beneficiary after cooling period", async () => {
      const saveMock = jest.fn().mockResolvedValue(true);
      const pendingBeneficiary = {
        ...mockBeneficiary,
        beneficiaryStatus: "PENDING_APPROVAL",
        activatedAt: null,
        createdAt: new Date(Date.now() - 60 * 60 * 1000),
        save: saveMock,
      };
      mockBeneficiaryFindOne.mockResolvedValue(pendingBeneficiary);
      mockAccountFindOne.mockResolvedValue({ ...mockAccount, balance: 50000, save: jest.fn().mockResolvedValue(true) });
      (checkBeneficiaryCoolingPeriod as jest.Mock).mockReturnValue(true);

      const result = await transferService.transferMoney(TEST_USER_ID, {
        beneficiaryId: TEST_BENEFICIARY_ID, amount: 1000,
      });

      expect(result.success).toBe(true);
      expect(pendingBeneficiary.beneficiaryStatus).toBe("ACTIVE");
      expect(saveMock).toHaveBeenCalled();
    });

    it("should reject PENDING_APPROVAL beneficiary still in cooling period", async () => {
      mockBeneficiaryFindOne.mockResolvedValue({
        ...mockBeneficiary,
        beneficiaryStatus: "PENDING_APPROVAL",
        activatedAt: null,
        createdAt: new Date(),
        save: jest.fn(),
      });
      (checkBeneficiaryCoolingPeriod as jest.Mock).mockReturnValue(false);

      await expect(
        transferService.transferMoney(TEST_USER_ID, { beneficiaryId: TEST_BENEFICIARY_ID, amount: 1000 })
      ).rejects.toThrow("Beneficiary is in cooling period");
    });

    it("should fail when account.save throws error", async () => {
      mockBeneficiaryFindOne.mockResolvedValue({ ...mockBeneficiary });
      mockAccountFindOne.mockResolvedValue({
        ...mockAccount, balance: 50000,
        save: jest.fn().mockRejectedValue(new Error("DB write error")),
      });

      await expect(
        transferService.transferMoney(TEST_USER_ID, { beneficiaryId: TEST_BENEFICIARY_ID, amount: 1000 })
      ).rejects.toThrow("Transfer failed");
    });

    it("should deduct correct amount from balance", async () => {
      const saveMock = jest.fn().mockResolvedValue(true);
      const accountData = { ...mockAccount, balance: 20000, save: saveMock };
      mockBeneficiaryFindOne.mockResolvedValue({ ...mockBeneficiary });
      mockAccountFindOne.mockResolvedValue(accountData);

      const result = await transferService.transferMoney(TEST_USER_ID, {
        beneficiaryId: TEST_BENEFICIARY_ID, amount: 7500,
      });

      expect(accountData.balance).toBe(12500);
      expect(saveMock).toHaveBeenCalled();
    });
  });
});
