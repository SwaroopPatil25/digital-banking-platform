export const BENEFICIARY_MESSAGES = {
  EMPTY_STATE: "No beneficiaries added",
  FETCH_ERROR: "Failed to load beneficiaries. Please try again.",
  ADD_BUTTON: "Add Beneficiary",
  ADD_SUCCESS: "Beneficiary added successfully.",
  ADD_ERROR: "Failed to add beneficiary. Please try again.",
  DUPLICATE_ERROR: "This beneficiary already exists.",
} as const;

export const BENEFICIARY_VALIDATION = {
  NAME_REQUIRED: "Beneficiary name is required.",
  NAME_MIN: "Name must be at least 3 characters.",
  ACCOUNT_REQUIRED: "Account number is required.",
  ACCOUNT_DIGITS: "Account number must contain digits only.",
  ACCOUNT_MIN: "Account number must be at least 8 digits.",
  ACCOUNT_MISMATCH: "Account numbers do not match.",
  BANK_REQUIRED: "Bank name is required.",
  IFSC_REQUIRED: "IFSC code is required.",
  IFSC_INVALID: "Invalid IFSC format (e.g. HDFC0001234).",
} as const;

export const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
