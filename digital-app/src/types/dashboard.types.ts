export interface DashboardUser {
  username: string;
}

export interface DashboardAccount {
  balance: number;
  accountNumber: string;
  creditScore: number;
  rewardPoints: number;
}

export interface DashboardTransaction {
  id: number;
  createdAt: string;
  description: string;
  amount: number;
  type: "debit" | "credit";
  status?: "SUCCESS" | "FAILED" | "PENDING" | "PROCESSING" | "REVERSED";
  referenceNumber?: string;
  failureReason?: string;
}

export interface DashboardNotification {
  id: number;
  message: string;
  type: "warning" | "info";
}

export interface DashboardCounts {
  beneficiaries: number;
  unreadNotifications: number;
  pendingTransfers: number;
  upcomingBills: number;
}

export interface DashboardData {
  user: DashboardUser;
  account: DashboardAccount;
  transactions: DashboardTransaction[];
  notifications: DashboardNotification[];
  counts?: DashboardCounts;
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}
