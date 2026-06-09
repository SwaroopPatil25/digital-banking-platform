import { z } from "zod";

export const payBillSchema = z.object({
  category: z.enum(
    ["electricity", "mobile", "dth", "broadband", "water", "gas", "creditCard", "loanEmi"],
    { message: "Invalid bill category" }
  ),
  billerName: z.string().min(2, "Biller name must be at least 2 characters"),
  consumerNumber: z.string().min(1, "Consumer number is required"),
  amount: z.number().positive("Amount must be greater than 0"),
});

export type PayBillInput = z.infer<typeof payBillSchema>;
