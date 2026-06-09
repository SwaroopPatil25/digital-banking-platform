export const validateAmount = (amount: number): string | null => {
  if (!amount || amount <= 0) return "Amount must be greater than 0";
  if (amount > 10000000) return "Amount exceeds maximum allowed limit";
  if (!Number.isFinite(amount)) return "Invalid amount";
  return null;
};

export const validateAccountNumber = (accountNumber: string): string | null => {
  if (!accountNumber || accountNumber.length < 8) return "Account number must be at least 8 digits";
  if (!/^\d+$/.test(accountNumber)) return "Account number must contain digits only";
  return null;
};

export const validateConsumerNumber = (consumerNumber: string): string | null => {
  if (!consumerNumber || consumerNumber.trim().length === 0) return "Consumer number is required";
  return null;
};

export const validateMobile = (mobile: string): string | null => {
  if (!mobile) return "Mobile number is required";
  if (!/^[6-9]\d{9}$/.test(mobile)) return "Invalid mobile number format";
  return null;
};

export const validatePAN = (pan: string): string | null => {
  if (!pan) return null; // Optional
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase())) return "Invalid PAN format";
  return null;
};

export const validateIFSC = (ifsc: string): string | null => {
  if (!ifsc) return "IFSC code is required";
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) return "Invalid IFSC code format";
  return null;
};

export const validateDateRange = (fromDate: string, toDate: string): string | null => {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  if (isNaN(from.getTime())) return "Invalid from date";
  if (isNaN(to.getTime())) return "Invalid to date";
  if (from > to) return "From date must be before to date";
  return null;
};
