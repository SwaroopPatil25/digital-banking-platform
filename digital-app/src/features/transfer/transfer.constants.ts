export const TRANSFER_MESSAGES = {
  FETCH_ERROR: "Failed to load transfer data. Please try again.",
  SUCCESS: "Transfer successful!",
  INSUFFICIENT_BALANCE: "Insufficient balance.",
  SERVER_ERROR: "Transfer failed. Please try again.",
  NO_BENEFICIARIES: "No beneficiaries available. Please add one first.",
  BENEFICIARY_PENDING: "This beneficiary is under cooling period. Transfer not allowed yet.",
  LIMIT_EXCEEDED: "Daily transfer limit reached. Please try tomorrow.",
  FRAUD_DETECTED: "Transaction flagged for security verification.",
  DUPLICATE: "This transaction was already processed.",
} as const;

export const TRANSFER_VALIDATION = {
  BENEFICIARY_REQUIRED: "Please select a beneficiary.",
  AMOUNT_REQUIRED: "Amount is required.",
  AMOUNT_POSITIVE: "Amount must be greater than 0.",
  AMOUNT_EXCEEDS: "Amount exceeds available balance.",
  REMARKS_REQUIRED: "Remarks is required.",
} as const;

export const TRANSFER_STEPS = ["Select Beneficiary", "Enter Details", "Review", "Processing"] as const;
