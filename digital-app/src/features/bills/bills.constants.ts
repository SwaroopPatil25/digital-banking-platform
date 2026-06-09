export const BILLS_MESSAGES = {
  FETCH_ERROR: "Failed to load bill payment data. Please try again.",
  PAYMENT_SUCCESS: "Bill payment successful!",
  INSUFFICIENT_BALANCE: "Insufficient balance.",
  SERVER_ERROR: "Bill payment failed. Please try again.",
} as const;

export const BILLS_VALIDATION = {
  CATEGORY_REQUIRED: "Please select a bill category.",
  BILLER_REQUIRED: "Biller name is required.",
  REFERENCE_REQUIRED: "This field is required.",
  MOBILE_INVALID: "Enter valid 10-digit mobile number.",
  REFERENCE_MIN: "Must be at least 3 characters.",
  AMOUNT_REQUIRED: "Amount is required.",
  AMOUNT_POSITIVE: "Amount must be greater than 0.",
  AMOUNT_EXCEEDS: "Amount exceeds available balance.",
} as const;

export const CATEGORY_FIELD_CONFIG: Record<string, { label: string; placeholder: string }> = {
  electricity: { label: "Consumer Number", placeholder: "Enter Consumer Number" },
  water: { label: "Consumer Number", placeholder: "Enter Consumer Number" },
  gas: { label: "Consumer Number", placeholder: "Enter Consumer Number" },
  mobile: { label: "Mobile Number", placeholder: "Enter Mobile Number" },
  dth: { label: "Subscriber ID", placeholder: "Enter Subscriber ID" },
  broadband: { label: "Customer ID / Account Number", placeholder: "Enter Customer ID / Account Number" },
  creditCard: { label: "Credit Card Number", placeholder: "Enter Credit Card Number" },
  loanEmi: { label: "Loan Account Number", placeholder: "Enter Loan Account Number" },
};

export const DEFAULT_FIELD_CONFIG = { label: "Reference Number", placeholder: "Enter Reference Number" };

export const MOBILE_REGEX = /^\d{10}$/;
