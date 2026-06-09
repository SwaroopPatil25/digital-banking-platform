import type { QuickAction } from "./dashboard.types";
import transferIcon from "../../assets/icons/transfer.svg";
import receiptIcon from "../../assets/icons/receipt.svg";
import documentIcon from "../../assets/icons/document.svg";
import userIcon from "../../assets/icons/user.svg";
import shieldIcon from "../../assets/icons/shield.svg";

export const quickActions: QuickAction[] = [
  { label: "Transfer Money", icon: transferIcon, route: "/transfer"},
  { label: "Pay Bills", icon: receiptIcon, route: "/pay-bills"},
  { label: "Download Statement", icon: documentIcon, route: "/statement"},
  { label: "Add Beneficiary", icon: userIcon, route: "/beneficiaries"},
  { label: "Activity Log", icon: shieldIcon, route: "/activity"},
];
