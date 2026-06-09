import type { TransactionFilters as Filters, TxnType, TxnStatus, TxnCategory } from "../transactions.types";

interface TransactionFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onClear: () => void;
}

const TransactionFiltersPanel = ({ filters, onChange, onClear }: TransactionFiltersProps) => {
  const update = (key: keyof Filters, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-800">Filters</h4>
        {hasActiveFilters && (
          <button onClick={onClear} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
            Clear All
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">Search</label>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => update("search", e.target.value)}
          placeholder="Description, ref no, biller..."
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
        />
      </div>

      {/* Type */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">Type</label>
        <select
          value={filters.type}
          onChange={(e) => update("type", e.target.value as TxnType)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
        >
          <option value="">All</option>
          <option value="debit">Debit</option>
          <option value="credit">Credit</option>
        </select>
      </div>

      {/* Status */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">Status</label>
        <select
          value={filters.status}
          onChange={(e) => update("status", e.target.value as TxnStatus)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
        >
          <option value="">All</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILED">Failed</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="REVERSED">Reversed</option>
        </select>
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">Category</label>
        <select
          value={filters.category}
          onChange={(e) => update("category", e.target.value as TxnCategory)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
        >
          <option value="">All</option>
          <option value="TRANSFER">Transfer</option>
          <option value="BILL_PAYMENT">Bill Payment</option>
          <option value="UPI">UPI</option>
          <option value="CARD">Card</option>
          <option value="DEPOSIT">Deposit</option>
        </select>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-500 mb-1">From</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => update("startDate", e.target.value)}
            className="w-full px-2 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">To</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => update("endDate", e.target.value)}
            className="w-full px-2 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
          />
        </div>
      </div>

      {/* Amount Range */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Min ₹</label>
          <input
            type="number"
            value={filters.minAmount}
            onChange={(e) => update("minAmount", e.target.value)}
            placeholder="0"
            className="w-full px-2 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Max ₹</label>
          <input
            type="number"
            value={filters.maxAmount}
            onChange={(e) => update("maxAmount", e.target.value)}
            placeholder="∞"
            className="w-full px-2 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
          />
        </div>
      </div>
    </div>
  );
};

export default TransactionFiltersPanel;
