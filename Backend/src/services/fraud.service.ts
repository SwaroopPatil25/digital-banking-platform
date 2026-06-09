import Transaction from "../models/transaction.model.js";
import User from "../models/user.model.js";
import { BankingError, ErrorCodes, createBankingError } from "../utils/errors.js";
import { notifyLargeTransaction, notifySuspiciousActivity } from "./notification-event.service.js";

const DAILY_TRANSFER_LIMIT = 200000; // ₹2,00,000
const DAILY_TRANSFER_COUNT_LIMIT = 20;
const LARGE_TRANSFER_THRESHOLD = 50000; // ₹50,000
const RAPID_TRANSFER_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const RAPID_TRANSFER_COUNT = 5;

const resetDailyLimitsIfNeeded = async (user: any): Promise<void> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!user.dailyLimitResetDate || user.dailyLimitResetDate < today) {
    user.dailyTransferAmount = 0;
    user.dailyTransferCount = 0;
    user.dailyLimitResetDate = today;
    await user.save();
  }
};

export const checkTransferLimits = async (userId: string, amount: number): Promise<void> => {
  const user = await User.findById(userId);
  if (!user) throw createBankingError(ErrorCodes.USER_NOT_FOUND);

  await resetDailyLimitsIfNeeded(user);

  // Daily amount limit
  if (user.dailyTransferAmount + amount > DAILY_TRANSFER_LIMIT) {
    throw createBankingError(ErrorCodes.TRANSFER_LIMIT_EXCEEDED);
  }

  // Daily count limit
  if (user.dailyTransferCount >= DAILY_TRANSFER_COUNT_LIMIT) {
    throw createBankingError(ErrorCodes.TRANSFER_COUNT_EXCEEDED);
  }
};

export const updateDailyLimits = async (userId: string, amount: number): Promise<void> => {
  await User.findByIdAndUpdate(userId, {
    $inc: { dailyTransferAmount: amount, dailyTransferCount: 1 },
  });
};

export const checkRapidTransfers = async (userId: string): Promise<boolean> => {
  const windowStart = new Date(Date.now() - RAPID_TRANSFER_WINDOW_MS);
  const recentCount = await Transaction.countDocuments({
    userId,
    category: "TRANSFER",
    status: { $in: ["SUCCESS", "PROCESSING", "PENDING"] },
    transactionDate: { $gte: windowStart },
  });

  if (recentCount >= RAPID_TRANSFER_COUNT) {
    await notifySuspiciousActivity(userId);
    return true; // suspicious
  }
  return false;
};

export const assessRisk = async (userId: string, amount: number): Promise<"NORMAL" | "HIGH_RISK" | "SUSPICIOUS"> => {
  // Large transfer flagging
  if (amount >= LARGE_TRANSFER_THRESHOLD) {
    await notifyLargeTransaction(userId, amount);
    const isSuspicious = await checkRapidTransfers(userId);
    return isSuspicious ? "SUSPICIOUS" : "HIGH_RISK";
  }

  const isSuspicious = await checkRapidTransfers(userId);
  return isSuspicious ? "SUSPICIOUS" : "NORMAL";
};

export const checkBeneficiaryCoolingPeriod = (activatedAt: Date | undefined, createdAt: Date): boolean => {
  // 30-minute cooling period
  const COOLING_MS = 30 * 60 * 1000;
  const referenceTime = activatedAt || createdAt;
  return Date.now() - referenceTime.getTime() >= COOLING_MS;
};
