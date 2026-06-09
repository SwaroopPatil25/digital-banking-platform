import { TEST_USER_ID, mockUser } from "../utils/helpers";

const mockFindOne = jest.fn();
const mockFindById = jest.fn();
const mockFindByIdAndUpdate = jest.fn();
const mockCreate = jest.fn();
const mockAccountFindOne = jest.fn();
const mockAccountCreate = jest.fn();

jest.mock("../../models/user.model", () => ({
  __esModule: true,
  default: {
    findOne: (...args: any[]) => mockFindOne(...args),
    findById: (...args: any[]) => mockFindById(...args),
    findByIdAndUpdate: (...args: any[]) => mockFindByIdAndUpdate(...args),
    create: (...args: any[]) => mockCreate(...args),
  },
}));
jest.mock("../../models/account.model", () => ({
  __esModule: true,
  default: {
    findOne: (...args: any[]) => mockAccountFindOne(...args),
    create: (...args: any[]) => mockAccountCreate(...args),
  },
}));
jest.mock("bcryptjs", () => ({
  __esModule: true,
  default: {
    hash: jest.fn().mockResolvedValue("$2a$10$hashedpassword"),
    compare: jest.fn(),
  },
}));
jest.mock("../../utils/jwt", () => ({
  __esModule: true,
  generateToken: jest.fn().mockReturnValue("mock-jwt-token"),
  verifyToken: jest.fn(),
}));
jest.mock("../../utils/bankingDataGenerator", () => ({
  generateBalance: jest.fn().mockReturnValue(10000),
  generateCreditScore: jest.fn().mockReturnValue(750),
  generateRewardPoints: jest.fn().mockReturnValue(100),
  generateBranch: jest.fn().mockReturnValue({ branch: "Test Branch", ifscCode: "TEST0001234" }),
  generateUniqueAccountNumber: jest.fn().mockResolvedValue("1234567890"),
  generateUniqueCustomerId: jest.fn().mockResolvedValue("CUST001"),
}));
jest.mock("../../utils/registrationSeed", () => ({
  seedStarterTransactions: jest.fn().mockResolvedValue(undefined),
  seedStarterNotifications: jest.fn().mockResolvedValue(undefined),
  seedUpcomingBills: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("../../services/audit.service", () => ({
  auditLogin: jest.fn(),
  auditLoginFailed: jest.fn(),
  auditLogout: jest.fn(),
  auditProfileUpdated: jest.fn(),
}));

import bcrypt from "bcryptjs";
import * as authService from "../../services/auth.service";

describe("Auth Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    it("should register user successfully", async () => {
      mockFindOne.mockResolvedValue(null);
      mockCreate.mockResolvedValue({ _id: "user-001", username: "newuser" });
      mockAccountCreate.mockResolvedValue({ _id: "acc-001" });

      const result = await authService.registerUser({
        username: "newuser",
        email: "new@example.com",
        password: "StrongPass1!",
        confirmPassword: "StrongPass1!",
        mobileNo: "9876543210",
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe("User registered successfully");
      expect(mockCreate).toHaveBeenCalled();
      expect(mockAccountCreate).toHaveBeenCalled();
    });

    it("should throw error if email already registered", async () => {
      mockFindOne.mockResolvedValue({ _id: "existing-user" });

      await expect(
        authService.registerUser({
          username: "newuser",
          email: "existing@example.com",
          password: "StrongPass1!",
          confirmPassword: "StrongPass1!",
          mobileNo: "9876543210",
        })
      ).rejects.toThrow("Email already registered");
    });

    it("should use default role and accountType when not provided", async () => {
      mockFindOne.mockResolvedValue(null);
      mockCreate.mockResolvedValue({ _id: "user-002", username: "newuser2" });
      mockAccountCreate.mockResolvedValue({ _id: "acc-002" });

      await authService.registerUser({
        username: "newuser2",
        email: "new2@example.com",
        password: "Pass123!",
        confirmPassword: "Pass123!",
        mobileNo: "9876543211",
      });

      const userCreateCall = mockCreate.mock.calls[0][0];
      expect(userCreateCall.role).toBe("user");

      const accountCreateCall = mockAccountCreate.mock.calls[0][0];
      expect(accountCreateCall.accountType).toBe("savings");
    });
  });

  describe("loginUser", () => {
    it("should login successfully with valid credentials", async () => {
      const loginUser = { ...mockUser, save: jest.fn().mockResolvedValue(true) };
      mockFindOne.mockResolvedValue(loginUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.loginUser(
        { email: "test@example.com", password: "Password123" },
        "127.0.0.1",
        "jest-agent"
      );

      expect(result.success).toBe(true);
      expect(result.token).toBe("mock-jwt-token");
      expect(result.user.email).toBe("test@example.com");
    });

    it("should throw error for non-existent user", async () => {
      mockFindOne.mockResolvedValue(null);

      await expect(
        authService.loginUser({ email: "nouser@example.com", password: "pass" }, "127.0.0.1", "agent")
      ).rejects.toThrow("Invalid email or password");
    });

    it("should throw error for wrong password", async () => {
      const loginUser = { ...mockUser, save: jest.fn().mockResolvedValue(true) };
      mockFindOne.mockResolvedValue(loginUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.loginUser({ email: "test@example.com", password: "wrongpass" }, "127.0.0.1", "agent")
      ).rejects.toThrow("Invalid email or password");
    });

    it("should throw error for locked account", async () => {
      mockFindOne.mockResolvedValue({ ...mockUser, isLocked: true });

      await expect(
        authService.loginUser({ email: "test@example.com", password: "pass" }, "127.0.0.1", "agent")
      ).rejects.toThrow("Account is locked");
    });

    it("should increment failed login attempts on wrong password", async () => {
      const saveMock = jest.fn().mockResolvedValue(true);
      const loginUser = { ...mockUser, failedLoginAttempts: 0, save: saveMock };
      mockFindOne.mockResolvedValue(loginUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.loginUser({ email: "test@example.com", password: "wrong" }, "127.0.0.1", "agent")
      ).rejects.toThrow();

      expect(loginUser.failedLoginAttempts).toBe(1);
      expect(saveMock).toHaveBeenCalled();
    });

    it("should lock account after 5 failed attempts", async () => {
      const saveMock = jest.fn().mockResolvedValue(true);
      const loginUser = { ...mockUser, failedLoginAttempts: 4, isLocked: false, save: saveMock };
      mockFindOne.mockResolvedValue(loginUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.loginUser({ email: "test@example.com", password: "wrong" }, "127.0.0.1", "agent")
      ).rejects.toThrow();

      expect(loginUser.isLocked).toBe(true);
    });
  });

  describe("logoutUser", () => {
    it("should logout successfully", async () => {
      mockFindByIdAndUpdate.mockResolvedValue(true);

      const result = await authService.logoutUser(TEST_USER_ID, "127.0.0.1");

      expect(result.success).toBe(true);
      expect(result.message).toBe("Logged out successfully");
    });
  });

  describe("getUserProfile", () => {
    it("should return user profile with account", async () => {
      const mockUserProfile = {
        username: "testuser", email: "test@example.com", mobileNo: "9876543210",
        birthDate: "1990-01-01", gender: "Male", employmentStatus: "salaried",
        annualIncome: "500000", panNo: "ABCDE1234F", customerId: "CUST001",
        mfaEnabled: false, preferences: { emailAlerts: true, smsAlerts: true, contactMethod: "Email" },
        address: { city: "Mumbai" }, lastLogin: new Date(), loginCount: 5,
      };

      mockFindById.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUserProfile) });
      mockAccountFindOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({ accountNumber: "1234567890", accountType: "savings", branch: "Mumbai Main", kycStatus: "Verified" }),
      });
      mockFindByIdAndUpdate.mockResolvedValue(true);

      const result = await authService.getUserProfile(TEST_USER_ID);

      expect(result.username).toBe("testuser");
      expect(result.account).not.toBeNull();
      expect(result.account!.accountNumber).toBe("1234567890");
    });

    it("should return profile with null account when no account exists", async () => {
      const mockUserProfile = {
        username: "testuser", email: "test@example.com", mobileNo: "9876543210",
        preferences: { emailAlerts: true, smsAlerts: true, contactMethod: "Email" },
        address: { city: "Mumbai" }, lastLogin: new Date(), loginCount: 1,
      };

      mockFindById.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUserProfile) });
      mockAccountFindOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
      mockFindByIdAndUpdate.mockResolvedValue(true);

      const result = await authService.getUserProfile(TEST_USER_ID);

      expect(result.account).toBeNull();
    });

    it("should throw error if user not found", async () => {
      mockFindById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

      await expect(authService.getUserProfile("invalid-id")).rejects.toThrow("User not found");
    });
  });

  describe("updateUserProfile", () => {
    it("should update basic profile fields", async () => {
      const saveMock = jest.fn().mockResolvedValue(true);
      const user = { ...mockUser, address: { city: "Old" }, preferences: { emailAlerts: true, smsAlerts: true, contactMethod: "Email" }, save: saveMock };
      mockFindById.mockResolvedValue(user);

      const result = await authService.updateUserProfile(TEST_USER_ID, {
        username: "updatedName",
        mobileNo: "1111111111",
        gender: "Female",
        employmentStatus: "salaried",
        annualIncome: "800000",
        mfaEnabled: true,
        birthDate: "1995-05-05",
      });

      expect(result.success).toBe(true);
      expect(user.username).toBe("updatedName");
      expect(user.mfaEnabled).toBe(true);
      expect(saveMock).toHaveBeenCalled();
    });

    it("should update address fields", async () => {
      const saveMock = jest.fn().mockResolvedValue(true);
      const user = { ...mockUser, address: { city: "Mumbai", state: "MH" }, preferences: { emailAlerts: true, smsAlerts: true, contactMethod: "Email" }, save: saveMock };
      mockFindById.mockResolvedValue(user);

      const result = await authService.updateUserProfile(TEST_USER_ID, {
        address: { city: "Delhi", pincode: "110001" },
      });

      expect(result.success).toBe(true);
      expect(user.address.city).toBe("Delhi");
    });

    it("should update preferences", async () => {
      const saveMock = jest.fn().mockResolvedValue(true);
      const user = { ...mockUser, address: {}, preferences: { emailAlerts: true, smsAlerts: true, contactMethod: "Email" }, save: saveMock };
      mockFindById.mockResolvedValue(user);

      const result = await authService.updateUserProfile(TEST_USER_ID, {
        preferences: { emailAlerts: false, smsAlerts: false, contactMethod: "SMS" },
      });

      expect(result.success).toBe(true);
      expect(user.preferences.emailAlerts).toBe(false);
      expect(user.preferences.contactMethod).toBe("SMS");
    });

    it("should throw error if user not found", async () => {
      mockFindById.mockResolvedValue(null);

      await expect(
        authService.updateUserProfile("invalid-id", { username: "test" })
      ).rejects.toThrow("User not found");
    });
  });
});
