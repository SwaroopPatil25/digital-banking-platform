import AuditLog from "../models/audit-log.model.js";

interface AuditParams {
  userId: string;
  action: string;
  module: string;
  description: string;
  status: "SUCCESS" | "FAILED" | "PENDING" | "WARNING";
  entityId?: string;
  entityType?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: string;
}

/**
 * Creates an audit log entry. NEVER throws — failures are silently logged.
 * Activity logging must never break banking operations.
 */
export const createAuditLog = async (params: AuditParams): Promise<void> => {
  try {
    await AuditLog.create(params);
  } catch (error: any) {
    console.warn("Audit log creation failed (non-blocking):", error.message);
  }
};

// ──── AUTH ────
export const auditLogin = (userId: string, ip?: string, ua?: string) =>
  createAuditLog({
    userId,
    action: "LOGIN",
    module: "AUTH",
    description: "User logged in successfully",
    status: "SUCCESS",
    ipAddress: ip,
    userAgent: ua,
  });

export const auditLoginFailed = (userId: string, reason: string, ip?: string, ua?: string) =>
  createAuditLog({
    userId,
    action: "LOGIN_FAILED",
    module: "AUTH",
    description: `Login failed: ${reason}`,
    status: "FAILED",
    ipAddress: ip,
    userAgent: ua,
  });

export const auditLogout = (userId: string, ip?: string) =>
  createAuditLog({
    userId,
    action: "LOGOUT",
    module: "AUTH",
    description: "User logged out",
    status: "SUCCESS",
    ipAddress: ip,
  });

// ──── TRANSFER ────
export const auditTransferInitiated = (userId: string, txnId: string, amount: number, beneficiary: string) =>
  createAuditLog({
    userId,
    action: "TRANSFER_INITIATED",
    module: "TRANSFER",
    description: `Transfer of ₹${amount.toLocaleString("en-IN")} initiated to ${beneficiary}`,
    status: "PENDING",
    entityId: txnId,
    entityType: "Transaction",
    metadata: { amount, beneficiaryName: beneficiary },
  });

export const auditTransferSuccess = (userId: string, txnId: string, amount: number, beneficiary: string) =>
  createAuditLog({
    userId,
    action: "TRANSFER_SUCCESS",
    module: "TRANSFER",
    description: `₹${amount.toLocaleString("en-IN")} transferred successfully to ${beneficiary}`,
    status: "SUCCESS",
    entityId: txnId,
    entityType: "Transaction",
    metadata: { amount, beneficiaryName: beneficiary },
  });

export const auditTransferFailed = (userId: string, txnId: string, amount: number, beneficiary: string, reason: string) =>
  createAuditLog({
    userId,
    action: "TRANSFER_FAILED",
    module: "TRANSFER",
    description: `Transfer of ₹${amount.toLocaleString("en-IN")} to ${beneficiary} failed: ${reason}`,
    status: "FAILED",
    entityId: txnId,
    entityType: "Transaction",
    metadata: { amount, beneficiaryName: beneficiary, reason },
  });

// ──── BILL PAYMENT ────
export const auditBillPayment = (userId: string, billId: string, amount: number, billerName: string) =>
  createAuditLog({
    userId,
    action: "BILL_PAYMENT",
    module: "PAY_BILLS",
    description: `Bill of ₹${amount.toLocaleString("en-IN")} paid to ${billerName}`,
    status: "SUCCESS",
    entityId: billId,
    entityType: "BillPayment",
    metadata: { amount, billerName },
  });

export const auditBillPaymentFailed = (userId: string, amount: number, billerName: string, reason: string) =>
  createAuditLog({
    userId,
    action: "BILL_PAYMENT_FAILED",
    module: "PAY_BILLS",
    description: `Bill payment of ₹${amount.toLocaleString("en-IN")} to ${billerName} failed: ${reason}`,
    status: "FAILED",
    metadata: { amount, billerName, reason },
  });

// ──── BENEFICIARY ────
export const auditBeneficiaryAdded = (userId: string, beneficiaryId: string, name: string) =>
  createAuditLog({
    userId,
    action: "BENEFICIARY_ADDED",
    module: "BENEFICIARY",
    description: `Beneficiary "${name}" added`,
    status: "SUCCESS",
    entityId: beneficiaryId,
    entityType: "Beneficiary",
    metadata: { beneficiaryName: name },
  });

export const auditBeneficiaryRemoved = (userId: string, beneficiaryId: string, name: string) =>
  createAuditLog({
    userId,
    action: "BENEFICIARY_REMOVED",
    module: "BENEFICIARY",
    description: `Beneficiary "${name}" removed`,
    status: "SUCCESS",
    entityId: beneficiaryId,
    entityType: "Beneficiary",
    metadata: { beneficiaryName: name },
  });

// ──── PROFILE ────
export const auditProfileUpdated = (userId: string, changes: Record<string, any>) =>
  createAuditLog({
    userId,
    action: "PROFILE_UPDATED",
    module: "PROFILE",
    description: "Profile updated",
    status: "SUCCESS",
    entityId: userId,
    entityType: "User",
    metadata: changes,
  });

// ──── STATEMENT ────
export const auditStatementDownload = (userId: string, format: string, fromDate: string, toDate: string) =>
  createAuditLog({
    userId,
    action: "STATEMENT_DOWNLOAD",
    module: "STATEMENT",
    description: `Statement downloaded (${format.toUpperCase()}) for ${fromDate} to ${toDate}`,
    status: "SUCCESS",
    metadata: { format, fromDate, toDate },
  });

// ──── NOTIFICATIONS ────
export const auditNotificationRead = (userId: string, notificationId: string) =>
  createAuditLog({
    userId,
    action: "NOTIFICATION_READ",
    module: "NOTIFICATIONS",
    description: "Notification marked as read",
    status: "SUCCESS",
    entityId: notificationId,
    entityType: "Notification",
  });

export const auditNotificationReadAll = (userId: string) =>
  createAuditLog({
    userId,
    action: "NOTIFICATION_READ_ALL",
    module: "NOTIFICATIONS",
    description: "All notifications marked as read",
    status: "SUCCESS",
  });

// ──── SECURITY ────
export const auditFraudDetected = (userId: string, reason: string, metadata?: Record<string, any>) =>
  createAuditLog({
    userId,
    action: "FRAUD_DETECTED",
    module: "SECURITY",
    description: `Fraud/risk detected: ${reason}`,
    status: "WARNING",
    metadata,
  });

export const auditRateLimitExceeded = (userId: string, endpoint: string, ip?: string) =>
  createAuditLog({
    userId,
    action: "RATE_LIMIT_EXCEEDED",
    module: "SECURITY",
    description: `Rate limit exceeded on ${endpoint}`,
    status: "WARNING",
    ipAddress: ip,
    metadata: { endpoint },
  });
