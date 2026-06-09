import { TEST_USER_ID, mockBeneficiary } from "../utils/helpers";

const mockFindOne = jest.fn();
const mockFind = jest.fn();
const mockCreate = jest.fn();
const mockCountDocuments = jest.fn();

jest.mock("../../models/beneficiary.model", () => ({
  __esModule: true,
  default: {
    findOne: (...args: any[]) => mockFindOne(...args),
    find: (...args: any[]) => mockFind(...args),
    create: (...args: any[]) => mockCreate(...args),
    countDocuments: (...args: any[]) => mockCountDocuments(...args),
  },
}));
jest.mock("../../services/notification-event.service", () => ({
  notifyBeneficiaryAdded: jest.fn(),
}));
jest.mock("../../services/audit.service", () => ({
  auditBeneficiaryAdded: jest.fn(),
  auditBeneficiaryRemoved: jest.fn(),
}));
jest.mock("../../utils/pagination", () => ({
  buildPaginationResult: jest.fn().mockReturnValue({ page: 1, limit: 10, total: 1, totalPages: 1 }),
  getSkip: jest.fn().mockReturnValue(0),
}));

import * as beneficiaryService from "../../services/beneficiary.service";

describe("Beneficiary Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addBeneficiary", () => {
    it("should add beneficiary successfully", async () => {
      mockFindOne.mockResolvedValue(null);
      mockCreate.mockResolvedValue({ _id: "new-ben-001", beneficiaryName: "Jane Doe" });

      const result = await beneficiaryService.addBeneficiary(TEST_USER_ID, {
        beneficiaryName: "Jane Doe",
        accountNumber: "11223344556",
        bankName: "SBI",
        ifscCode: "SBIN0001234",
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("Beneficiary added");
    });

    it("should fail for duplicate beneficiary", async () => {
      mockFindOne.mockResolvedValue(mockBeneficiary);

      await expect(
        beneficiaryService.addBeneficiary(TEST_USER_ID, {
          beneficiaryName: "John Doe",
          accountNumber: "9876543210",
          bankName: "Test Bank",
          ifscCode: "TEST0001234",
        })
      ).rejects.toThrow("Beneficiary with same account number and IFSC already exists");
    });
  });

  describe("getBeneficiaries", () => {
    it("should return list of beneficiaries", async () => {
      const mockList = [
        { ...mockBeneficiary, beneficiaryStatus: "ACTIVE", createdAt: new Date(Date.now() - 60 * 60 * 1000) },
      ];
      mockFind.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockList),
      });
      mockCountDocuments.mockResolvedValue(1);

      const result = await beneficiaryService.getBeneficiaries(TEST_USER_ID, { page: 1, limit: 10 });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  describe("deleteBeneficiary", () => {
    it("should soft delete beneficiary", async () => {
      const saveMock = jest.fn().mockResolvedValue(true);
      mockFindOne.mockResolvedValue({ ...mockBeneficiary, save: saveMock });

      const result = await beneficiaryService.deleteBeneficiary(TEST_USER_ID, "ben-001");

      expect(result.success).toBe(true);
      expect(result.message).toBe("Beneficiary removed successfully");
      expect(saveMock).toHaveBeenCalled();
    });

    it("should fail when beneficiary not found", async () => {
      mockFindOne.mockResolvedValue(null);

      await expect(
        beneficiaryService.deleteBeneficiary(TEST_USER_ID, "non-existent")
      ).rejects.toThrow("Beneficiary not found");
    });
  });
});
