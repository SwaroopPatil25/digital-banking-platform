import Account from "../models/account.model.js";
import User from "../models/user.model.js";

export const getAccountDetails = async (userId: string) => {
  const account = await Account.findOne({ userId });
  if (!account) {
    throw new Error("Account not found");
  }

  const user = await User.findById(userId).select("customerId");

  return {
    success: true,
    account: {
      customerId: user?.customerId || "",
      accountNumber: `XXXX${account.accountNumber.slice(-4)}`,
      accountType: account.accountType,
      balance: account.balance,
      creditScore: account.creditScore,
      rewardPoints: account.rewardPoints,
      status: account.status,
    },
  };
};
