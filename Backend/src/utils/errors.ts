export class BankingError extends Error {
  errorCode: string;
  statusCode: number;

  constructor(errorCode: string, message: string, statusCode: number = 400) {
    super(message);
    this.errorCode = errorCode;
    this.statusCode = statusCode;
  }
}

export const ErrorCodes = {
  INVALID_ACCOUNT: { code: "INVALID_ACCOUNT", message: "Account not found", status: 404 },
  INSUFFICIENT_BALANCE: { code: "INSUFFICIENT_BALANCE", message: "Insufficient balance", status: 400 },
  BENEFICIARY_BLOCKED: { code: "BENEFICIARY_BLOCKED", message: "Beneficiary is blocked", status: 403 },
  BENEFICIARY_PENDING: { code: "BENEFICIARY_PENDING", message: "Beneficiary is in cooling period. Please wait before transferring.", status: 403 },
  BENEFICIARY_NOT_FOUND: { code: "BENEFICIARY_NOT_FOUND", message: "Beneficiary not found", status: 404 },
  SESSION_EXPIRED: { code: "SESSION_EXPIRED", message: "Session expired. Please login again.", status: 401 },
  TRANSFER_LIMIT_EXCEEDED: { code: "TRANSFER_LIMIT_EXCEEDED", message: "Daily transfer limit exceeded (₹2,00,000)", status: 403 },
  TRANSFER_COUNT_EXCEEDED: { code: "TRANSFER_COUNT_EXCEEDED", message: "Daily transfer count limit exceeded (20 transfers)", status: 403 },
  FRAUD_RISK_DETECTED: { code: "FRAUD_RISK_DETECTED", message: "Suspicious activity detected. Transaction flagged for review.", status: 403 },
  DUPLICATE_REQUEST: { code: "DUPLICATE_REQUEST", message: "Duplicate request detected. Previous response returned.", status: 200 },
  VALIDATION_FAILED: { code: "VALIDATION_FAILED", message: "Validation failed", status: 400 },
  USER_NOT_FOUND: { code: "USER_NOT_FOUND", message: "User not found", status: 404 },
  INVALID_CREDENTIALS: { code: "INVALID_CREDENTIALS", message: "Invalid email or password", status: 401 },
  ACCOUNT_LOCKED: { code: "ACCOUNT_LOCKED", message: "Account is locked due to multiple failed attempts", status: 403 },
  TRANSFER_FAILED: { code: "TRANSFER_FAILED", message: "Transfer failed", status: 500 },
  BILL_PAYMENT_FAILED: { code: "BILL_PAYMENT_FAILED", message: "Bill payment failed", status: 500 },
} as const;

export const createBankingError = (errorDef: { code: string; message: string; status: number }, customMessage?: string) => {
  return new BankingError(errorDef.code, customMessage || errorDef.message, errorDef.status);
};

export const formatErrorResponse = (error: BankingError) => ({
  success: false,
  errorCode: error.errorCode,
  message: error.message,
  timestamp: new Date().toISOString(),
});
