import type { Account } from "../transfer.types";

interface BalanceCardProps {
  account: Account;
}

const BalanceCard = ({ account }: BalanceCardProps) => {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 text-white">
      <p className="text-blue-100 text-sm mb-1">Available Balance</p>
      <p className="text-2xl font-bold">
        ₹{account.balance.toLocaleString("en-IN")}
      </p>
      <div className="flex gap-4 mt-3 text-sm text-blue-200">
        <span>{account.accountNumber}</span>
        <span>•</span>
        <span>{account.accountType}</span>
      </div>
    </div>
  );
};

export default BalanceCard;
