interface RecentTransfer {
  beneficiaryName: string;
  amount: number;
  date: string;
}

interface TransferSidebarProps {
  recentTransfers?: RecentTransfer[];
  dailyUsed?: number;
  dailyLimit?: number;
}

const DEFAULT_LIMIT = 500000;

const formatDate = (dateStr: string): string => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const TransferSidebar = ({ recentTransfers = [], dailyUsed = 0, dailyLimit }: TransferSidebarProps) => {
  const limit = dailyLimit || DEFAULT_LIMIT;
  const percentage = Math.min((dailyUsed / limit) * 100, 100);
  const barColor = percentage > 80 ? "bg-red-500" : percentage > 50 ? "bg-amber-500" : "bg-blue-500";

  return (
    <div className="space-y-5">
      {/* Recent Transfers */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">Recent Transfers</h4>
        {recentTransfers.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-2xl mb-1">💸</p>
            <p className="text-xs text-gray-400">No recent transfers</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransfers.slice(0, 5).map((t, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-800">{t.beneficiaryName}</p>
                  <p className="text-[10px] text-gray-500">{formatDate(t.date)}</p>
                </div>
                <span className="text-xs font-semibold text-red-500">-₹{t.amount.toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily Transfer Limit */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">Daily Transfer Limit</h4>
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Used</span>
          <span>₹{dailyUsed.toLocaleString("en-IN")} / ₹{limit.toLocaleString("en-IN")}</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${percentage}%` }} />
        </div>
        {percentage > 80 && (
          <p className="text-xs text-red-500 mt-2 font-medium">⚠️ Approaching daily limit</p>
        )}
        <p className="text-xs text-gray-400 mt-2">Resets daily at midnight</p>
      </div>

      {/* Safe Banking Tips */}
      <div className="bg-blue-50 rounded-xl border border-blue-100 p-5">
        <h4 className="text-sm font-semibold text-blue-800 mb-3">Safe Transfer Tips</h4>
        <ul className="space-y-2 text-xs text-blue-700">
          <li className="flex gap-2"><span>•</span>Verify beneficiary details before transfer</li>
          <li className="flex gap-2"><span>•</span>Double-check account number</li>
          <li className="flex gap-2"><span>•</span>Never share OTP with anyone</li>
          <li className="flex gap-2"><span>•</span>Transfer only after verification</li>
        </ul>
      </div>
    </div>
  );
};

export default TransferSidebar;
