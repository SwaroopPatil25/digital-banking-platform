import jwt from "jsonwebtoken";

export const TEST_USER_ID = "507f1f77bcf86cd799439011";
export const TEST_ACCOUNT_ID = "507f1f77bcf86cd799439022";
export const TEST_BENEFICIARY_ID = "507f1f77bcf86cd799439033";

export const generateTestToken = (userId: string = TEST_USER_ID): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: "1h" });
};

export const generateExpiredToken = (): string => {
  return jwt.sign({ userId: TEST_USER_ID }, process.env.JWT_SECRET as string, { expiresIn: "-1h" });
};

export const mockUser = {
  _id: TEST_USER_ID,
  username: "testuser",
  email: "test@example.com",
  password: "$2a$10$hashedpassword",
  mobileNo: "9876543210",
  isLocked: false,
  failedLoginAttempts: 0,
  lastLogin: new Date(),
  lastActive: new Date(),
  loginCount: 1,
  sessionCount: 1,
  save: jest.fn().mockResolvedValue(true),
};

export const mockAccount = {
  _id: TEST_ACCOUNT_ID,
  userId: TEST_USER_ID,
  accountNumber: "1234567890",
  accountType: "savings",
  balance: 50000,
  creditScore: 750,
  rewardPoints: 100,
  status: "Active",
  branch: "Mumbai Main",
  ifscCode: "BANK0001234",
  kycStatus: "Verified",
  save: jest.fn().mockResolvedValue(true),
};

export const mockBeneficiary = {
  _id: TEST_BENEFICIARY_ID,
  userId: TEST_USER_ID,
  beneficiaryName: "John Doe",
  accountNumber: "9876543210",
  bankName: "Test Bank",
  ifscCode: "TEST0001234",
  beneficiaryStatus: "ACTIVE",
  isDeleted: false,
  createdAt: new Date(Date.now() - 60 * 60 * 1000),
  save: jest.fn().mockResolvedValue(true),
};
