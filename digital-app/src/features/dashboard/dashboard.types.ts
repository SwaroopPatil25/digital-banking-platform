export interface AccountCardProps {
  title: string;
  value: string;
  icon: string;
}

export interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: "debit" | "credit";
}

export interface Notification {
  id: number;
  message: string;
  type: "warning" | "info";
}

export interface QuickAction {
  label: string;
  icon: string;
  route: string;
}
