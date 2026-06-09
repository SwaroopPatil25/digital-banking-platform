import User from "../models/user.model.js";
import Account from "../models/account.model.js";
import Transaction from "../models/transaction.model.js";
import Notification from "../models/notification.model.js";
import Beneficiary from "../models/beneficiary.model.js";
import UpcomingBill from "../models/upcoming-bill.model.js";

export const getDashboardData = async (userId: string) => {
  const user = await User.findById(userId).select("username");
  if (!user) {
    throw new Error("User not found");
  }

  const [account, transactions, notifications, unreadCount, beneficiaryCount, upcomingBills] = await Promise.all([
    Account.findOne({ userId }),
    Transaction.find({ userId }).sort({ transactionDate: -1 }).limit(10),
    Notification.find({ userId, isDeleted: { $ne: true } }).sort({ createdAt: -1 }).limit(10),
    Notification.countDocuments({ userId, isRead: false, isDeleted: { $ne: true } }),
    Beneficiary.countDocuments({ userId, isDeleted: { $ne: true } }),
    UpcomingBill.find({ userId, status: "pending" }).sort({ dueDate: 1 }).limit(5),
  ]);

  return {
    success: true,
    data: {
      user: { username: user.username },
      account: account
        ? {
            balance: account.balance,
            accountNumber: `XXXX${account.accountNumber.slice(-4)}`,
            creditScore: account.creditScore,
            rewardPoints: account.rewardPoints,
          }
        : null,
      transactions,
      notifications,
      notificationCount: unreadCount,
      beneficiaryCount,
      upcomingBills,
    },
  };
};
