import { z } from "zod";

export const transactionQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  type: z.enum(["credit", "debit", "CREDIT", "DEBIT"]).optional(),
  category: z.enum(["TRANSFER", "BILL_PAYMENT", "ACCOUNT_CREDIT", "ACCOUNT_DEBIT"]).optional(),
  status: z.enum(["SUCCESS", "FAILED", "PENDING"]).optional(),
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  sortBy: z.enum(["transactionDate", "amount", "createdAt"]).default("transactionDate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type TransactionQuery = z.infer<typeof transactionQuerySchema>;
