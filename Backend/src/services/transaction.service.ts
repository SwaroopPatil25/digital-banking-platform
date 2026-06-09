import Transaction from "../models/transaction.model.js";
import { TransactionQuery } from "../validations/transaction.validation.js";
import { buildPaginationResult, getSkip } from "../utils/pagination.js";

export const getTransactions = async (userId: string, query: TransactionQuery) => {
  const { page, limit, type, category, status, search, startDate, endDate, minAmount, maxAmount, sortBy, sortOrder } = query;

  const filter: Record<string, any> = { userId };

  // Type filter
  if (type) {
    filter.type = type.toUpperCase();
  }

  // Category filter
  if (category) {
    filter.category = category;
  }

  // Status filter
  if (status) {
    filter.status = status;
  }

  // Date range filter
  if (startDate || endDate) {
    filter.transactionDate = {};
    if (startDate) {
      filter.transactionDate.$gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.transactionDate.$lte = end;
    }
  }

  // Amount range filter
  if (minAmount !== undefined || maxAmount !== undefined) {
    filter.amount = {};
    if (minAmount !== undefined) {
      filter.amount.$gte = minAmount;
    }
    if (maxAmount !== undefined) {
      filter.amount.$lte = maxAmount;
    }
  }

  // Search across multiple fields
  if (search) {
    filter.$or = [
      { description: { $regex: search, $options: "i" } },
      { referenceNumber: { $regex: search, $options: "i" } },
      { billerName: { $regex: search, $options: "i" } },
      { beneficiaryName: { $regex: search, $options: "i" } },
    ];
  }

  const skip = getSkip(page, limit);
  const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const [transactions, totalRecords] = await Promise.all([
    Transaction.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select("type category amount description status referenceNumber transactionDate beneficiaryName billerName balanceAfterTransaction remarks createdAt"),
    Transaction.countDocuments(filter),
  ]);

  const filtersApplied: Record<string, any> = {};
  if (type) filtersApplied.type = type;
  if (category) filtersApplied.category = category;
  if (status) filtersApplied.status = status;
  if (search) filtersApplied.search = search;
  if (startDate) filtersApplied.startDate = startDate;
  if (endDate) filtersApplied.endDate = endDate;
  if (minAmount !== undefined) filtersApplied.minAmount = minAmount;
  if (maxAmount !== undefined) filtersApplied.maxAmount = maxAmount;

  return {
    success: true,
    data: transactions,
    pagination: buildPaginationResult(page, limit, totalRecords),
    filtersApplied,
  };
};

export const getTransactionById = async (userId: string, transactionId: string) => {
  const transaction = await Transaction.findOne({ _id: transactionId, userId });
  if (!transaction) {
    throw new Error("Transaction not found");
  }

  return { success: true, transaction };
};
