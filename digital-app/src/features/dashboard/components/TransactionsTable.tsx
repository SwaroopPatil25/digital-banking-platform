import type { DashboardTransaction } from "../../../types/dashboard.types";
import { formatDateTime } from "../../../utils/dateFormatter";
import StatusBadge from "../../../shared/components/StatusBadge";
import { useNavigate } from "react-router-dom";

interface TransactionsTableProps {
  transactions: DashboardTransaction[];
}

const TransactionsTable = ({ transactions }: TransactionsTableProps) => {
  const navigate = useNavigate();
  const list = Array.isArray(transactions) ? transactions : [];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-800">Recent Transactions</h3>
        <button
          onClick={() => navigate("/transactions")}
          className="text-xs font-medium text-blue-600 hover:text-blue-700 transition"
        >
          View All →
        </button>
      </div>
      {list.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-2xl mb-2">📋</p>
          <p className="text-sm text-gray-500">No recent transactions</p>
          <button
            onClick={() => navigate("/transfer")}
            className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            Make a Transfer →
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</th>
                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {list.map((txn) => (
                <tr key={txn.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3.5 text-gray-500 text-xs">{formatDateTime(txn.createdAt)}</td>
                  <td className="py-3.5 text-gray-800 font-medium">{txn.description}</td>
                  <td className="py-3.5">
                    <StatusBadge
                      status={txn.status || "SUCCESS"}
                      tooltip={txn.failureReason}
                    />
                  </td>
                  <td className={`py-3.5 font-semibold text-right ${txn.type.toLowerCase() === "credit" ? "text-emerald-600" : "text-red-500"}`}>
                    {txn.type.toLowerCase() === "credit" ? "+" : "−"} ₹{Math.abs(txn.amount).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionsTable;
