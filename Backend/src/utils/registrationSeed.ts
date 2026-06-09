import mongoose from "mongoose";
import Transaction from "../models/transaction.model.js";
import Notification from "../models/notification.model.js";
import UpcomingBill from "../models/upcoming-bill.model.js";
import { generateTransactionReference } from "./transaction.helper.js";

const daysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const daysFromNow = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

export const seedStarterTransactions = async (
  userId: mongoose.Types.ObjectId,
  accountId: mongoose.Types.ObjectId,
  balance: number
) => {
  const transactions = [
    {
      userId,
      accountId,
      type: "CREDIT" as const,
      category: "ACCOUNT_CREDIT" as const,
      amount: balance,
      description: "Account Opening Credit - Initial Deposit",
      status: "SUCCESS" as const,
      referenceNumber: generateTransactionReference(),
      balanceAfterTransaction: balance,
      transactionDate: daysAgo(15),
    },
    {
      userId,
      accountId,
      type: "DEBIT" as const,
      category: "ACCOUNT_DEBIT" as const,
      amount: 299,
      description: "Debit Card Issuance Fee",
      status: "SUCCESS" as const,
      referenceNumber: generateTransactionReference(),
      balanceAfterTransaction: balance - 299,
      transactionDate: daysAgo(14),
    },
    {
      userId,
      accountId,
      type: "CREDIT" as const,
      category: "ACCOUNT_CREDIT" as const,
      amount: 500,
      description: "Welcome Cashback Reward",
      status: "SUCCESS" as const,
      referenceNumber: generateTransactionReference(),
      balanceAfterTransaction: balance - 299 + 500,
      transactionDate: daysAgo(12),
    },
    {
      userId,
      accountId,
      type: "CREDIT" as const,
      category: "ACCOUNT_CREDIT" as const,
      amount: 150,
      description: "Referral Bonus",
      status: "SUCCESS" as const,
      referenceNumber: generateTransactionReference(),
      balanceAfterTransaction: balance - 299 + 500 + 150,
      transactionDate: daysAgo(5),
    },
  ];

  await Transaction.insertMany(transactions);
};

export const seedStarterNotifications = async (userId: mongoose.Types.ObjectId, username: string) => {
  const notifications = [
    {
      userId,
      title: "Welcome",
      message: `Welcome to DigiBank, ${username}! Your account is now active.`,
      type: "SYSTEM" as const,
      isRead: false,
    },
    {
      userId,
      title: "Account Created",
      message: "Your account has been successfully created. Explore our services!",
      type: "SYSTEM" as const,
      isRead: false,
    },
    {
      userId,
      title: "KYC Pending",
      message: "KYC verification is pending. Please complete it for full access.",
      type: "ALERT" as const,
      isRead: false,
    },
    {
      userId,
      title: "Debit Card Issued",
      message: "Your Debit Card has been issued. It will arrive in 5-7 business days.",
      type: "SYSTEM" as const,
      isRead: false,
    },
    {
      userId,
      title: "UPI Setup",
      message: "Enable UPI payments for instant transfers. Set up now!",
      type: "PROMOTION" as const,
      isRead: false,
    },
  ];

  await Notification.insertMany(notifications);
};

export const seedUpcomingBills = async (userId: mongoose.Types.ObjectId) => {
  const bills = [
    {
      userId,
      category: "electricity",
      billerName: "Tata Power",
      consumerNumber: `TP${Math.floor(100000000 + Math.random() * 900000000)}`,
      amount: Math.floor(800 + Math.random() * 2200),
      dueDate: daysFromNow(Math.floor(5 + Math.random() * 10)),
      status: "pending" as const,
    },
    {
      userId,
      category: "mobile",
      billerName: "Jio Prepaid",
      consumerNumber: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
      amount: Math.floor(199 + Math.random() * 600),
      dueDate: daysFromNow(Math.floor(5 + Math.random() * 15)),
      status: "pending" as const,
    },
    {
      userId,
      category: "broadband",
      billerName: "Airtel Xstream",
      consumerNumber: `AX${Math.floor(1000000 + Math.random() * 9000000)}`,
      amount: Math.floor(699 + Math.random() * 800),
      dueDate: daysFromNow(Math.floor(8 + Math.random() * 12)),
      status: "pending" as const,
    },
  ];

  await UpcomingBill.insertMany(bills);
};
