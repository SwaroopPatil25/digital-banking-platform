import { TEST_USER_ID } from "../utils/helpers";

const mockFind = jest.fn();
const mockCountDocuments = jest.fn();

jest.mock("../../models/audit-log.model", () => ({
  __esModule: true,
  default: {
    find: (...args: any[]) => mockFind(...args),
    countDocuments: (...args: any[]) => mockCountDocuments(...args),
  },
}));

import * as activityService from "../../services/activity.service";

const setupMocks = (data: any[] = [], total = 0) => {
  mockFind.mockReturnValue({
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    select: jest.fn().mockResolvedValue(data),
  });
  mockCountDocuments.mockResolvedValue(total);
};

describe("Activity Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getActivityHistory", () => {
    it("should return activity list with pagination", async () => {
      const mockData = [
        { action: "LOGIN", module: "AUTH", description: "User logged in", status: "SUCCESS" },
        { action: "TRANSFER", module: "TRANSFER", description: "Transfer completed", status: "SUCCESS" },
      ];
      setupMocks(mockData, 2);

      const result = await activityService.getActivityHistory(TEST_USER_ID, { page: 1, limit: 15 });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
    });

    it("should return empty data when no activities", async () => {
      setupMocks([], 0);

      const result = await activityService.getActivityHistory(TEST_USER_ID, { page: 1, limit: 15 });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });

    it("should handle pagination correctly", async () => {
      setupMocks([], 30);

      const result = await activityService.getActivityHistory(TEST_USER_ID, { page: 2, limit: 15 });

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.totalPages).toBe(2);
      expect(result.pagination.hasNextPage).toBe(false);
      expect(result.pagination.hasPreviousPage).toBe(true);
    });

    it("should apply type filter", async () => {
      setupMocks([], 0);

      await activityService.getActivityHistory(TEST_USER_ID, { page: 1, limit: 15, type: "LOGIN" });

      const filterArg = mockFind.mock.calls[0][0];
      expect(filterArg.action).toBe("LOGIN");
    });

    it("should apply module filter", async () => {
      setupMocks([], 0);

      await activityService.getActivityHistory(TEST_USER_ID, { page: 1, limit: 15, module: "TRANSFER" });

      const filterArg = mockFind.mock.calls[0][0];
      expect(filterArg.module).toBe("TRANSFER");
    });

    it("should apply status filter", async () => {
      setupMocks([], 0);

      await activityService.getActivityHistory(TEST_USER_ID, { page: 1, limit: 15, status: "SUCCESS" });

      const filterArg = mockFind.mock.calls[0][0];
      expect(filterArg.status).toBe("SUCCESS");
    });

    it("should apply single date filter", async () => {
      setupMocks([], 0);

      await activityService.getActivityHistory(TEST_USER_ID, { page: 1, limit: 15, date: "2024-01-15" });

      const filterArg = mockFind.mock.calls[0][0];
      expect(filterArg.createdAt).toBeDefined();
      expect(filterArg.createdAt.$gte).toBeDefined();
      expect(filterArg.createdAt.$lte).toBeDefined();
    });

    it("should apply dateFrom filter only", async () => {
      setupMocks([], 0);

      await activityService.getActivityHistory(TEST_USER_ID, { page: 1, limit: 15, dateFrom: "2024-01-01" });

      const filterArg = mockFind.mock.calls[0][0];
      expect(filterArg.createdAt.$gte).toBeDefined();
    });

    it("should apply dateTo filter only", async () => {
      setupMocks([], 0);

      await activityService.getActivityHistory(TEST_USER_ID, { page: 1, limit: 15, dateTo: "2024-12-31" });

      const filterArg = mockFind.mock.calls[0][0];
      expect(filterArg.createdAt.$lte).toBeDefined();
    });

    it("should apply dateFrom and dateTo range filter", async () => {
      setupMocks([], 0);

      await activityService.getActivityHistory(TEST_USER_ID, { page: 1, limit: 15, dateFrom: "2024-01-01", dateTo: "2024-06-30" });

      const filterArg = mockFind.mock.calls[0][0];
      expect(filterArg.createdAt.$gte).toBeDefined();
      expect(filterArg.createdAt.$lte).toBeDefined();
    });

    it("should apply search filter", async () => {
      setupMocks([], 0);

      await activityService.getActivityHistory(TEST_USER_ID, { page: 1, limit: 15, search: "transfer" });

      const filterArg = mockFind.mock.calls[0][0];
      expect(filterArg.$or).toBeDefined();
      expect(filterArg.$or).toHaveLength(3);
    });
  });
});
