export type TransactionStatus = "SUCCESS" | "FAILED" | "PENDING" | "PROCESSING" | "REVERSED";

interface StatusBadgeProps {
  status: TransactionStatus | string;
  tooltip?: string;
}

const STATUS_CONFIG: Record<string, { style: string; label: string }> = {
  SUCCESS: { style: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Success" },
  FAILED: { style: "bg-red-100 text-red-700 border-red-200", label: "Failed" },
  PENDING: { style: "bg-amber-100 text-amber-700 border-amber-200", label: "Pending" },
  PROCESSING: { style: "bg-blue-100 text-blue-700 border-blue-200", label: "Processing" },
  REVERSED: { style: "bg-gray-100 text-gray-600 border-gray-200", label: "Reversed" },
};

const StatusBadge = ({ status, tooltip }: StatusBadgeProps) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;

  return (
    <span
      title={tooltip}
      className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full border cursor-default ${config.style}`}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
