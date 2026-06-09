import type { BankingData } from "../profile.types";
import bankIcon from "../../../assets/icons/bank.svg";

interface BankingInfoProps {
  data: BankingData;
  memberSince?: string;
}

const BankingInfo = ({ data, memberSince }: BankingInfoProps) => {
  const kycBadge =
    data.kycStatus === "Verified"
      ? "text-green-700 bg-green-100 border-green-200"
      : data.kycStatus === "Pending"
      ? "text-yellow-700 bg-yellow-100 border-yellow-200"
      : "text-red-700 bg-red-100 border-red-200";

  const fields = [
    { label: "Customer ID", value: data.customerId },
    { label: "Account Number", value: data.accountNumber },
    { label: "Branch", value: data.branch },
    ...(memberSince ? [{ label: "Member Since", value: memberSince }] : []),
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <img src={bankIcon} alt="Banking" className="w-5 h-5" />
          <h3 className="text-lg font-semibold text-gray-800">Banking Relationship</h3>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          {data.accountType}
        </span>
      </div>
      <div className="space-y-3">
        {fields.map((field) => (
          <div key={field.label} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-2 border-b border-gray-50 last:border-0">
            <span className="text-sm text-gray-500 sm:w-44 shrink-0 text-left">{field.label}</span>
            <span className="text-sm font-medium text-gray-800">{field.value}</span>
          </div>
        ))}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-2">
          <span className="text-sm text-gray-500 sm:w-44 shrink-0 text-left">KYC Status</span>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border w-fit ${kycBadge}`}>
            {data.kycStatus}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BankingInfo;
