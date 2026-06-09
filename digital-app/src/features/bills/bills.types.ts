export interface Account {
  customerId: string;
  accountNumber: string;
  accountType: string;
  balance: number;
}

export interface AccountResponse {
  success: boolean;
  account: Account;
}

export interface BillCategory {
  label: string;
  value: string;
}

export interface BillCategoriesResponse {
  success: boolean;
  categories: BillCategory[];
}

export interface BillPaymentPayload {
  category: string;
  billerName: string;
  referenceNumber: string;
  amount: number;
}

export interface BillPaymentData {
  updatedBalance: number;
  transactionId: string;
  billPaymentId: string;
  referenceNumber?: string;
  status?: "SUCCESS" | "FAILED" | "PENDING";
  timestamp?: string;
}

export interface BillPaymentResponse {
  success: boolean;
  message: string;
  data: BillPaymentData;
}
