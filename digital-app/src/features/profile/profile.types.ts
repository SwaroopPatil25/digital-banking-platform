export interface ProfileAddress {
  city: string;
  state: string;
  pincode: string;
  addressLine: string;
}

export interface ProfilePreferences {
  emailAlerts: boolean;
  smsAlerts: boolean;
  contactMethod: string;
}

export interface ProfileAccount {
  accountNumber: string;
  accountType: string;
  branch: string;
  kycStatus: "Verified" | "Pending" | "Rejected";
}

export interface ProfileUser {
  username: string;
  email: string;
  mobileNo: string;
  birthDate: string;
  gender: string;
  employmentStatus: string;
  annualIncome: string;
  panNo: string;
  customerId: string;
  mfaEnabled: boolean;
  preferences: ProfilePreferences;
  address: ProfileAddress;
  account: ProfileAccount;
}

export interface ProfileResponse {
  success: boolean;
  user: ProfileUser;
}

export interface UpdateProfilePayload {
  username: string;
  mobileNo: string;
  birthDate: string;
  gender: string;
  employmentStatus: string;
  annualIncome: string;
  mfaEnabled: boolean;
  preferences: ProfilePreferences;
  address: ProfileAddress;
}

// Existing component prop types (kept for reuse)
export interface ProfileFieldProps {
  label: string;
  value: string;
  name: string;
  editable: boolean;
  type?: "text" | "tel" | "date" | "select" | "textarea";
  options?: { label: string; value: string }[];
  fullWidth?: boolean;
  onChange: (name: string, value: string) => void;
}

export interface BankingData {
  customerId: string;
  accountNumber: string;
  accountType: string;
  branch: string;
  kycStatus: "Verified" | "Pending" | "Rejected";
}

export interface SecurityData {
  mfaEnabled: boolean;
}

export interface NotificationData {
  emailAlerts: boolean;
  smsAlerts: boolean;
}
