import { useEffect, useState } from "react";
import AppLayout from "../../shared/layout/AppLayout";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "../../hooks/useDebounce";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchTransactions, setTransactionFilters, clearTransactionFilters } from "../../store/slices/transactionSlice";
import type { TransactionFilters } from "./transactions.types";
import TransactionFiltersPanel from "./components/TransactionFiltersPanel";
import Pagination from "../../shared/components/Pagination";
import StatusBadge from "../../shared/components/StatusBadge";
import { formatDateTime } from "../../utils/dateFormatter";

const Transactions = () => {
  const dispatch = useAppDispatch();
  const { transactions, pagination, filters, loading } = useAppSelector((state) => state.transactions);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const navigate = useNavigate();
  const debouncedSearch = useDebounce(filters.search, 400);

  useEffect(() => {
    dispatch(fetchTransactions({ page: 1, filters, debouncedSearch }));
  }, [dispatch, filters.type, filters.status, filters.category, filters.startDate, filters.endDate, filters.minAmount, filters.maxAmount, debouncedSearch]);

  const handlePageChange = (page: number) => {
    dispatch(fetchTransactions({ page, filters, debouncedSearch }));
  };

  const handleFiltersChange = (newFilters: TransactionFilters) => {
    dispatch(setTransactionFilters(newFilters));
  };

  const handleClearFilters = () => {
    dispatch(clearTransactionFilters());
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <AppLayout isAuthenticated={true}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button onClick={() => navigate("/dashboard")} className="flex items-center justify-center w-9 h-9 text-lg text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition">←</button>
            <h2 className="ml-2 text-xl font-semibold text-gray-900">Transaction History</h2>
          </div>
          <button
            onClick={() => setShowFilters((p) => !p)}
            className="lg:hidden px-3 py-1.5 text-xs font-medium rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
          >
            {showFilters ? "Hide Filters" : "Filters"}
          </button>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          <div>
            {loading ? (
              <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex justify-between">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-40" />
                      <div className="h-3 bg-gray-100 rounded w-24" />
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-20" />
                  </div>
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                <p className="text-4xl mb-3">📋</p>
                <p className="text-gray-500 text-sm font-medium">No transactions found</p>
                <p className="text-gray-400 text-xs mt-1">Try adjusting your filters or date range</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b border-gray-100 bg-gray-50/50">
                        <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                        <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</th>
                        <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                        <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((txn) => (
                        <>
                          <tr
                            key={txn._id}
                            onClick={() => toggleExpand(txn._id)}
                            className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors cursor-pointer"
                          >
                            <td className="px-5 py-3.5 text-gray-500 text-xs">{formatDateTime(txn.createdAt)}</td>
                            <td className="px-5 py-3.5 text-gray-800 font-medium">{txn.description}</td>
                            <td className="px-5 py-3.5">
                              <StatusBadge
                                status={txn.status || "SUCCESS"}
                                tooltip={txn.failureReason || txn.reversalReason}
                              />
                            </td>
                            <td className={`px-5 py-3.5 font-semibold text-right ${txn.type === "credit" ? "text-emerald-600" : "text-red-500"}`}>
                              {txn.type === "credit" ? "+" : "−"} ₹{Math.abs(txn.amount).toLocaleString("en-IN")}
                            </td>
                          </tr>
                          {expandedId === txn._id && (
                            <tr key={`${txn._id}-detail`}>
                              <td colSpan={4} className="px-5 py-4 bg-gray-50 border-b border-gray-100">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                                  {txn.referenceNumber && (
                                    <div>
                                      <span className="text-gray-400 block">Reference No</span>
                                      <span className="text-gray-700 font-mono">{txn.referenceNumber}</span>
                                    </div>
                                  )}
                                  {txn.category && (
                                    <div>
                                      <span className="text-gray-400 block">Category</span>
                                      <span className="text-gray-700 capitalize">{txn.category.replace("_", " ").toLowerCase()}</span>
                                    </div>
                                  )}
                                  {txn.statusUpdatedAt && (
                                    <div>
                                      <span className="text-gray-400 block">Status Updated</span>
                                      <span className="text-gray-700">{formatDateTime(txn.statusUpdatedAt)}</span>
                                    </div>
                                  )}
                                  {txn.beneficiaryName && (
                                    <div>
                                      <span className="text-gray-400 block">Beneficiary</span>
                                      <span className="text-gray-700">{txn.beneficiaryName}</span>
                                    </div>
                                  )}
                                  {txn.beneficiaryBank && (
                                    <div>
                                      <span className="text-gray-400 block">Bank</span>
                                      <span className="text-gray-700">{txn.beneficiaryBank}</span>
                                    </div>
                                  )}
                                  {txn.billerName && (
                                    <div>
                                      <span className="text-gray-400 block">Biller</span>
                                      <span className="text-gray-700">{txn.billerName}</span>
                                    </div>
                                  )}
                                  {txn.failureReason && (
                                    <div className="col-span-full">
                                      <span className="text-red-400 block">Failure Reason</span>
                                      <span className="text-red-600">{txn.failureReason}</span>
                                    </div>
                                  )}
                                  {txn.reversalReason && (
                                    <div className="col-span-full">
                                      <span className="text-gray-400 block">Reversal Reason</span>
                                      <span className="text-gray-600">{txn.reversalReason}</span>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-3">
                  <Pagination
                    page={pagination.page}
                    totalPages={pagination.totalPages}
                    hasNext={pagination.hasNext}
                    hasPrevious={pagination.hasPrevious}
                    onPageChange={handlePageChange}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Filters Sidebar */}
          <div className={`${showFilters ? "block" : "hidden"} lg:block`}>
            <TransactionFiltersPanel
              filters={filters}
              onChange={handleFiltersChange}
              onClear={handleClearFilters}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Transactions;
