export const STATEMENT_MESSAGES = {
  DOWNLOAD_SUCCESS: "Statement downloaded successfully.",
  DOWNLOAD_ERROR: "Failed to download statement. Please try again.",
  NO_TRANSACTIONS: "No transactions found for the selected date range.",
  INVALID_DATE: "Invalid date range provided.",
} as const;

export const STATEMENT_VALIDATION = {
  FROM_DATE_REQUIRED: "From date is required.",
  TO_DATE_REQUIRED: "To date is required.",
  DATE_RANGE_INVALID: "From date must be before or equal to To date.",
  FORMAT_REQUIRED: "Format is required.",
} as const;

export const FORMAT_OPTIONS = [
  { label: "PDF", value: "pdf" },
  { label: "CSV", value: "csv" },
] as const;
