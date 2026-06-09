import { z } from "zod";

export const transferSchema = z.object({
  beneficiaryId: z.string().min(1, "Beneficiary ID is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  remarks: z.string().max(100, "Remarks must be 100 characters or less").optional(),
});

export type TransferInput = z.infer<typeof transferSchema>;
