import type { Beneficiary } from "../beneficiary.types";

interface BeneficiaryCardProps {
  beneficiary: Beneficiary;
}

const STATUS_CONFIG: Record<string, { style: string; label: string }> = {
  ACTIVE: { style: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Active" },
  PENDING_APPROVAL: { style: "bg-amber-100 text-amber-700 border-amber-200", label: "Pending" },
  BLOCKED: { style: "bg-red-100 text-red-700 border-red-200", label: "Blocked" },
};

const maskAccountNumber = (accountNumber: string): string => {
  if (!accountNumber || accountNumber.length <= 4) return accountNumber || "N/A";
  return "X".repeat(accountNumber.length - 4) + accountNumber.slice(-4);
};

const getTimeRemaining = (activationDate?: string): string | null => {
  if (!activationDate) return null;
  const diff = new Date(activationDate).getTime() - Date.now();
  if (diff <= 0) return null;
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `~${hours}h ${mins}m remaining`;
  return `~${mins}m remaining`;
};

const BeneficiaryCard = ({ beneficiary }: BeneficiaryCardProps) => {
  const { beneficiaryName, bankName, accountNumber, ifscCode, createdAt, status, activationDate } = beneficiary;
  const config = STATUS_CONFIG[status || "ACTIVE"];
  const remaining = status === "PENDING_APPROVAL" ? getTimeRemaining(activationDate) : null;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 hover:border-slate-500 transition">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-white font-semibold text-lg">{beneficiaryName}</h3>
        {status && status !== "ACTIVE" && (
          <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full border ${config.style}`}>
            {config.label}
          </span>
        )}
        {(!status || status === "ACTIVE") && (
          <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full border ${STATUS_CONFIG.ACTIVE.style}`}>
            Active
          </span>
        )}
      </div>
      <div className="space-y-1.5 text-sm text-slate-400">
        <p><span className="text-slate-500">Bank:</span> {bankName}</p>
        <p><span className="text-slate-500">A/C:</span> {maskAccountNumber(accountNumber)}</p>
        <p><span className="text-slate-500">IFSC:</span> {ifscCode}</p>
        <p><span className="text-slate-500">Added:</span> {createdAt ? new Date(createdAt).toLocaleDateString() : "N/A"}</p>
      </div>
      {remaining && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-400 bg-amber-900/20 px-3 py-1.5 rounded-md">
          <span>⏳</span>
          <span>Activates in {remaining}</span>
        </div>
      )}
    </div>
  );
};

export default BeneficiaryCard;
