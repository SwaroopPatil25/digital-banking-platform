export interface BillCategoryConfig {
  id: string;
  label: string;
  icon: string;
  value: string;
  billerPlaceholder: string;
}

export const BILL_CATEGORY_CONFIG: BillCategoryConfig[] = [
  { id: "electricity", label: "Electricity", icon: "⚡", value: "electricity", billerPlaceholder: "e.g. Tata Power" },
  { id: "mobile", label: "Mobile", icon: "📱", value: "mobile", billerPlaceholder: "e.g. Airtel Prepaid" },
  { id: "broadband", label: "Broadband", icon: "🌐", value: "broadband", billerPlaceholder: "e.g. Jio Fiber" },
  { id: "gas", label: "Gas", icon: "🔥", value: "gas", billerPlaceholder: "e.g. Bharat Gas" },
  { id: "water", label: "Water", icon: "💧", value: "water", billerPlaceholder: "e.g. Municipal Water Board" },
  { id: "dth", label: "DTH", icon: "📡", value: "dth", billerPlaceholder: "e.g. Tata Play" },
  { id: "creditCard", label: "Credit Card", icon: "💳", value: "creditCard", billerPlaceholder: "e.g. HDFC Credit Card" },
  { id: "insurance", label: "Insurance", icon: "🛡️", value: "insurance", billerPlaceholder: "e.g. LIC Premium" },
];

export const getBillerPlaceholder = (categoryValue: string): string => {
  const config = BILL_CATEGORY_CONFIG.find((c) => c.value === categoryValue);
  return config?.billerPlaceholder || "e.g. Biller Name";
};
