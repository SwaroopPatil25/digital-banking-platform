import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  mobileNo: string;
  birthDate?: string;
  gender?: "Male" | "Female" | "Other";
  employmentStatus?: "salaried" | "selfEmployed" | "student" | "retired";
  annualIncome?: string;
  panNo?: string;
  role: "user" | "admin";
  customerId: string;
  mfaEnabled: boolean;
  isActive: boolean;
  failedLoginAttempts: number;
  isLocked: boolean;
  address: {
    city?: string;
    state?: string;
    pincode?: string;
    addressLine?: string;
  };
  preferences: {
    contactMethod?: string;
    alerts: string[];
    emailAlerts: boolean;
    smsAlerts: boolean;
  };
  // Phase 3: Activity tracking
  lastLogin?: Date;
  lastLogout?: Date;
  lastActive?: Date;
  loginCount: number;
  sessionCount: number;
  lastLoginIp?: string;
  lastLoginDevice?: string;
  // Phase 3: Daily limits tracking
  dailyTransferAmount: number;
  dailyTransferCount: number;
  dailyLimitResetDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: [true, "Full name is required"] },
    email: { type: String, required: [true, "Email is required"], unique: true, lowercase: true },
    password: { type: String, required: [true, "Password is required"] },
    mobileNo: { type: String, required: [true, "Mobile number is required"] },
    birthDate: { type: String },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    employmentStatus: { type: String, enum: ["salaried", "selfEmployed", "student", "retired"] },
    annualIncome: { type: String },
    panNo: { type: String, uppercase: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    customerId: { type: String, required: [true, "Customer ID is required"], unique: true },
    mfaEnabled: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    failedLoginAttempts: { type: Number, default: 0 },
    isLocked: { type: Boolean, default: false },
    address: {
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
      addressLine: { type: String },
    },
    preferences: {
      contactMethod: { type: String },
      alerts: { type: [String], default: [] },
      emailAlerts: { type: Boolean, default: true },
      smsAlerts: { type: Boolean, default: true },
    },
    // Phase 3: Activity tracking
    lastLogin: { type: Date },
    lastLogout: { type: Date },
    lastActive: { type: Date },
    loginCount: { type: Number, default: 0 },
    sessionCount: { type: Number, default: 0 },
    lastLoginIp: { type: String },
    lastLoginDevice: { type: String },
    // Phase 3: Daily limits
    dailyTransferAmount: { type: Number, default: 0 },
    dailyTransferCount: { type: Number, default: 0 },
    dailyLimitResetDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
