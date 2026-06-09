export interface Account {
  customerId: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  rewardPoints: number;
  dailyLimit?: number;
  dailyUsed?: number;
}

export interface AccountResponse {
  success: boolean;
  account: Account;
}

export type BeneficiaryTransferStatus = "ACTIVE" | "PENDING_APPROVAL" | "BLOCKED";

export interface TransferBeneficiary {
  _id: string;
  beneficiaryName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  status?: BeneficiaryTransferStatus;
  activationDate?: string;
}

export interface BeneficiaryListResponse {
  success: boolean;
  beneficiaries: TransferBeneficiary[];
}

export interface TransferPayload {
  beneficiaryId: string;
  amount: number;
  remarks: string;
  idempotencyKey?: string;
}

export interface TransferResponseData {
  updatedBalance: number;
  transactionId: string;
  referenceNumber?: string;
  status?: "SUCCESS" | "FAILED" | "PENDING" | "PROCESSING";
  timestamp?: string;
  beneficiaryName?: string;
}

export interface TransferResponse {
  success: boolean;
  message: string;
  data: TransferResponseData;
}
