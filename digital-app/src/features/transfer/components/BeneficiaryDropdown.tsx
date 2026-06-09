import type { TransferBeneficiary } from "../transfer.types";
import { TRANSFER_MESSAGES } from "../transfer.constants";

interface BeneficiaryDropdownProps {
  beneficiaries: TransferBeneficiary[];
  value: string;
  onChange: (id: string) => void;
  error?: string;
}

const STATUS_LABEL: Record<string, { text: string; color: string }> = {
  ACTIVE: { text: "", color: "" },
  PENDING_APPROVAL: { text: "⏳ Pending", color: "text-amber-400" },
  BLOCKED: { text: "🚫 Blocked", color: "text-red-400" },
};

const BeneficiaryDropdown = ({ beneficiaries, value, onChange, error }: BeneficiaryDropdownProps) => {
  const list = Array.isArray(beneficiaries) ? beneficiaries : [];

  if (list.length === 0) {
    return (
      <div>
        <label style={{ textAlign: "left" }} className="block text-sm text-slate-400 mb-1">
          <span className="text-red-500">* </span>Beneficiary:</label>
        <p className="text-sm text-yellow-400">{TRANSFER_MESSAGES.NO_BENEFICIARIES}</p>
      </div>
    );
  }

  const activeList = list.filter((b) => b.status !== "BLOCKED");

  return (
    <div>
      <label style={{ textAlign: "left" }} className="block text-sm text-slate-400 mb-1">
        <span className="text-red-500">* </span>Beneficiary:</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-md bg-slate-900 border border-slate-600 text-white text-sm focus:outline-none focus:border-blue-500"
      >
        <option value="">Select beneficiary</option>
        {activeList.map((b) => {
          const status = STATUS_LABEL[b.status || "ACTIVE"];
          return (
            <option key={b._id} value={b._id}>
              {b.beneficiaryName} — {b.bankName} {status.text}
            </option>
          );
        })}
      </select>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default BeneficiaryDropdown;
