import { useEffect, useState } from "react";

interface StatementSidebarProps {
  onDateSelect: (from: string, to: string) => void;
}

interface DownloadRecord {
  format: string;
  date: string;
}

const STORAGE_KEY = "digibank_statement_history";

const getDateRange = (days: number): { from: string; to: string } => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
};

const getFYRange = (): { from: string; to: string } => {
  const now = new Date();
  const year = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return { from: `${year}-04-01`, to: `${year + 1}-03-31` };
};

const QUICK_FILTERS = [
  { label: "Last 7 Days", days: 7 },
  { label: "Last 30 Days", days: 30 },
  { label: "Last 3 Months", days: 90 },
  { label: "Last 6 Months", days: 180 },
];

export const saveDownloadHistory = (format: string) => {
  const history: DownloadRecord[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  history.unshift({ format, date: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 10)));
};

const StatementSidebar = ({ onDateSelect }: StatementSidebarProps) => {
  const [history, setHistory] = useState<DownloadRecord[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  return (
    <div className="space-y-5">
      {/* Quick Date Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">Quick Filters</h4>
        <div className="space-y-2">
          {QUICK_FILTERS.map((f) => (
            <button
              key={f.label}
              onClick={() => { const r = getDateRange(f.days); onDateSelect(r.from, r.to); }}
              className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 rounded-lg border border-gray-100 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition"
            >
              {f.label}
            </button>
          ))}
          <button
            onClick={() => { const r = getFYRange(); onDateSelect(r.from, r.to); }}
            className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 rounded-lg border border-gray-100 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition"
          >
            Financial Year
          </button>
        </div>
      </div>

      {/* Download History */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">Download History</h4>
        {history.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">No previous downloads</p>
        ) : (
          <div className="space-y-3">
            {history.map((h, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-800 uppercase">{h.format} Statement</span>
                <span className="text-[10px] text-gray-500">
                  {new Date(h.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Statement Info */}
      <div className="bg-green-50 rounded-xl border border-green-100 p-5">
        <h4 className="text-sm font-semibold text-green-800 mb-3">Statement Includes</h4>
        <ul className="space-y-2 text-xs text-green-700">
          <li className="flex gap-2"><span>•</span>Credits & Debits</li>
          <li className="flex gap-2"><span>•</span>Fund Transfers</li>
          <li className="flex gap-2"><span>•</span>Bill Payments</li>
          <li className="flex gap-2"><span>•</span>Account Activity</li>
        </ul>
      </div>
    </div>
  );
};

export default StatementSidebar;
