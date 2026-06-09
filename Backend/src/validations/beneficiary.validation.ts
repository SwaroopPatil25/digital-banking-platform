import { z } from "zod";

export const beneficiarySchema = z.object({
  beneficiaryName: z.string().min(3, "Beneficiary name must be at least 3 characters"),
  accountNumber: z
    .string()
    .min(8, "Account number must be at least 8 digits")
    .regex(/^\d+$/, "Account number must contain digits only"),
  bankName: z.string().min(1, "Bank name is required"),
  ifscCode: z
    .string()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format"),
  nickname: z.string().optional(),
});

export type BeneficiaryInput = z.infer<typeof beneficiarySchema>;
