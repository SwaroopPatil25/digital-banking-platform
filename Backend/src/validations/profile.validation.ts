import { z } from "zod";

export const updateProfileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
  mobileNo: z
    .string()
    .regex(/^\d{10}$/, "Mobile number must be exactly 10 digits")
    .optional(),
  birthDate: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  employmentStatus: z.enum(["salaried", "selfEmployed", "student", "retired"]).optional(),
  annualIncome: z.string().optional(),
  mfaEnabled: z.boolean().optional(),
  address: z
    .object({
      city: z.string().optional(),
      state: z.string().optional(),
      pincode: z
        .string()
        .regex(/^\d{6}$/, "Pincode must be exactly 6 digits")
        .optional(),
      addressLine: z.string().optional(),
    })
    .optional(),
  preferences: z
    .object({
      emailAlerts: z.boolean().optional(),
      smsAlerts: z.boolean().optional(),
      contactMethod: z.string().optional(),
    })
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
