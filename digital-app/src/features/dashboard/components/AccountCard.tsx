import type { AccountCardProps } from "../dashboard.types";

const AccountCard = ({ title, value, icon }: AccountCardProps) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
          <img src={icon} alt={title} className="w-5 h-5" />
        </div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
      </div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

export default AccountCard;
