import bcrypt from "bcryptjs";
import { securityConfig } from "../config/app.config.js";
import User from "../models/user.model.js";
import Account from "../models/account.model.js";
import { generateToken } from "../utils/jwt.js";
import {
  generateBalance,
  generateCreditScore,
  generateRewardPoints,
  generateBranch,
  generateUniqueAccountNumber,
  generateUniqueCustomerId,
} from "../utils/bankingDataGenerator.js";
import { seedStarterTransactions, seedStarterNotifications, seedUpcomingBills } from "../utils/registrationSeed.js";
import { RegisterInput, LoginInput } from "../validations/auth.validation.js";
import { auditLogin, auditLoginFailed, auditLogout, auditProfileUpdated } from "./audit.service.js";
import { BankingError, ErrorCodes, createBankingError } from "../utils/errors.js";

export const registerUser = async (data: RegisterInput) => {
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    throw new Error("Email already registered");
  }

  const hashedPassword = await bcrypt.hash(data.password, securityConfig.bcryptSaltRounds);
  const customerId = await generateUniqueCustomerId();

  const user = await User.create({
    username: data.username,
    email: data.email,
    password: hashedPassword,
    mobileNo: data.mobileNo,
    birthDate: data.birthDate,
    gender: data.gender,
    employmentStatus: data.employmentStatus,
    annualIncome: data.annualIncome,
    panNo: data.panNo,
    role: data.role || "user",
    customerId,
    mfaEnabled: false,
    address: {
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      addressLine: data.address,
    },
    preferences: {
      contactMethod: data.contactMethod || "Email",
      alerts: data.alerts || [],
      emailAlerts: true,
      smsAlerts: true,
    },
  });

  // Generate dynamic banking data
  const balance = generateBalance();
  const creditScore = generateCreditScore();
  const rewardPoints = generateRewardPoints();
  const { branch, ifscCode } = generateBranch();
  const accountNumber = await generateUniqueAccountNumber();

  const account = await Account.create({
    userId: user._id,
    accountNumber,
    accountType: data.accountType || "savings",
    balance,
    creditScore,
    rewardPoints,
    branch,
    ifscCode,
    kycStatus: "Pending",
  });

  // Seed starter data
  await seedStarterTransactions(user._id, account._id, balance);
  await seedStarterNotifications(user._id, data.username);
  await seedUpcomingBills(user._id);

  return { success: true, message: "User registered successfully" };
};

export const loginUser = async (data: LoginInput, ipAddress?: string, userAgent?: string) => {
  const user = await User.findOne({ email: data.email });
  if (!user) {
    throw createBankingError(ErrorCodes.INVALID_CREDENTIALS);
  }

  if (user.isLocked) {
    throw createBankingError(ErrorCodes.ACCOUNT_LOCKED);
  }

  const isMatch = await bcrypt.compare(data.password, user.password);
  if (!isMatch) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= 5) {
      user.isLocked = true;
    }
    await user.save();
    auditLoginFailed(String(user._id), "Invalid password", ipAddress, userAgent);
    throw createBankingError(ErrorCodes.INVALID_CREDENTIALS);
  }

  // Reset failed attempts on success
  user.failedLoginAttempts = 0;
  user.lastLogin = new Date();
  user.lastActive = new Date();
  user.loginCount += 1;
  user.sessionCount += 1;
  user.lastLoginIp = ipAddress;
  user.lastLoginDevice = userAgent;
  await user.save();

  const token = generateToken(String(user._id));

  // Non-blocking audit
  auditLogin(String(user._id), ipAddress, userAgent);

  return {
    success: true,
    message: "Login successful",
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  };
};

export const logoutUser = async (userId: string, ipAddress?: string) => {
  await User.findByIdAndUpdate(userId, {
    lastLogout: new Date(),
    $inc: { sessionCount: -1 },
  });
  auditLogout(userId, ipAddress);
  return { success: true, message: "Logged out successfully" };
};

export const getUserProfile = async (userId: string) => {
  const user = await User.findById(userId).select(
    "username email mobileNo birthDate gender employmentStatus annualIncome panNo customerId mfaEnabled preferences address lastLogin loginCount"
  );
  if (!user) {
    throw new Error("User not found");
  }

  const account = await Account.findOne({ userId }).select(
    "accountNumber accountType branch kycStatus"
  );

  // Update lastActive
  await User.findByIdAndUpdate(userId, { lastActive: new Date() });

  return {
    username: user.username,
    email: user.email,
    mobileNo: user.mobileNo,
    birthDate: user.birthDate,
    gender: user.gender,
    employmentStatus: user.employmentStatus,
    annualIncome: user.annualIncome,
    panNo: user.panNo,
    customerId: user.customerId,
    mfaEnabled: user.mfaEnabled,
    preferences: {
      emailAlerts: user.preferences.emailAlerts,
      smsAlerts: user.preferences.smsAlerts,
      contactMethod: user.preferences.contactMethod,
    },
    address: user.address,
    account: account
      ? {
          accountNumber: account.accountNumber,
          accountType: account.accountType,
          branch: account.branch,
          kycStatus: account.kycStatus,
        }
      : null,
    lastLogin: user.lastLogin,
    loginCount: user.loginCount,
  };
};

export const updateUserProfile = async (userId: string, data: any) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const changes: any = {};

  if (data.username !== undefined) { changes.username = data.username; user.username = data.username; }
  if (data.mobileNo !== undefined) { changes.mobileNo = data.mobileNo; user.mobileNo = data.mobileNo; }
  if (data.birthDate !== undefined) { changes.birthDate = data.birthDate; user.birthDate = data.birthDate; }
  if (data.gender !== undefined) { changes.gender = data.gender; user.gender = data.gender; }
  if (data.employmentStatus !== undefined) { changes.employmentStatus = data.employmentStatus; user.employmentStatus = data.employmentStatus; }
  if (data.annualIncome !== undefined) { changes.annualIncome = data.annualIncome; user.annualIncome = data.annualIncome; }
  if (data.mfaEnabled !== undefined) { changes.mfaEnabled = data.mfaEnabled; user.mfaEnabled = data.mfaEnabled; }

  if (data.address) {
    user.address = { ...user.address, ...data.address };
    changes.address = data.address;
  }

  if (data.preferences) {
    if (data.preferences.emailAlerts !== undefined) user.preferences.emailAlerts = data.preferences.emailAlerts;
    if (data.preferences.smsAlerts !== undefined) user.preferences.smsAlerts = data.preferences.smsAlerts;
    if (data.preferences.contactMethod !== undefined) user.preferences.contactMethod = data.preferences.contactMethod;
    changes.preferences = data.preferences;
  }

  await user.save();

  // Non-blocking audit
  auditProfileUpdated(userId, changes);

  return { success: true, message: "Profile updated successfully" };
};
