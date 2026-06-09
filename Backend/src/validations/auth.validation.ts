import { z } from "zod";

export const registerSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    mobileNo: z.string().regex(/^\d{10}$/, "Mobile number must be exactly 10 digits"),
    birthDate: z.string().optional(),
    gender: z.enum(["Male", "Female", "Other"]).optional(),
    employmentStatus: z.enum(["salaried", "selfEmployed", "student", "retired"]).optional(),
    accountType: z.enum(["savings", "current", "salary"]).optional(),
    annualIncome: z.string().optional(),
    panNo: z
      .string()
      .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN number")
      .optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z
      .string()
      .regex(/^\d{6}$/, "Pincode must be exactly 6 digits")
      .optional(),
    address: z.string().optional(),
    contactMethod: z.string().optional(),
    role: z.enum(["user", "admin"]).optional(),
    alerts: z.array(z.string()).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
