export type TxnType = "debit" | "credit" | "";
export type TxnStatus = "SUCCESS" | "FAILED" | "PENDING" | "PROCESSING" | "REVERSED" | "";
export type TxnCategory = "TRANSFER" | "BILL_PAYMENT" | "UPI" | "CARD" | "DEPOSIT" | "";

export interface Transaction {
  _id: string;
  description: string;
  amount: number;
  type: "debit" | "credit";
  status: "SUCCESS" | "FAILED" | "PENDING" | "PROCESSING" | "REVERSED";
  category?: string;
  createdAt: string;
  referenceNumber?: string;
  statusUpdatedAt?: string;
  failureReason?: string;
  reversalReason?: string;
  beneficiaryName?: string;
  beneficiaryBank?: string;
  billerName?: string;
  billerCategory?: string;
}

export interface TransactionFilters {
  type: TxnType;
  status: TxnStatus;
  category: TxnCategory;
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
  search: string;
}

export interface TransactionsResponse {
  success: boolean;
  transactions?: Transaction[];
  data?: Transaction[] | { items?: Transaction[] };
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    total: number;
  };
}
