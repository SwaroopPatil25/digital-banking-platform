import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import AppLayout from "../../shared/layout/AppLayout";
import { getAccountService } from "./transfer.service";
import { TRANSFER_MESSAGES } from "./transfer.constants";
import type { Account } from "./transfer.types";
import BalanceCard from "./components/BalanceCard";
import TransferForm from "./components/TransferForm";
import TransferSidebar from "../../shared/widgets/TransferSidebar";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axios";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { updateBalance } from "../../store/slices/dashboardSlice";
import { fetchBeneficiaries } from "../../store/slices/beneficiarySlice";
import { fetchRecentTransactions } from "../../store/slices/transactionSlice";

interface TransactionRecord {
  _id: string;
  description: string;
  amount: number;
  type: string;
  createdAt: string;
}

const Transfer = () => {
  const [account, setAccount] = useState<Account | null>(null);
  const [recentTransfers, setRecentTransfers] = useState<{ beneficiaryName: string; amount: number; date: string }[]>([]);
  const [dailyUsed, setDailyUsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Consume beneficiaries from Redux (shared with Beneficiary page)
  const { beneficiaries, loading: benLoading } = useAppSelector((state) => state.beneficiaries);

  const fetchTransferData = useCallback(async () => {
    try {
      const txnRes = await axiosInstance.get<{ success: boolean; transactions?: TransactionRecord[]; data?: TransactionRecord[] }>("/transactions", { params: { limit: 10 } });
      const allTxns = txnRes.data?.transactions || txnRes.data?.data || [];
      const safeAll = Array.isArray(allTxns) ? allTxns : [];
      const transfers = safeAll
        .filter((t) => t.type === "debit")
        .slice(0, 5)
        .map((t) => ({ beneficiaryName: t.description, amount: Math.abs(t.amount), date: t.createdAt }));
      setRecentTransfers(transfers);

      const today = new Date().toISOString().split("T")[0];
      const todayTotal = safeAll
        .filter((t) => t.type === "debit" && t.createdAt?.startsWith(today))
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      setDailyUsed(todayTotal);
    } catch {
      // Non-critical
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const accountRes = await getAccountService();
        setAccount(accountRes?.account || null);
        // Fetch beneficiaries from Redux (uses cache if recent)
        dispatch(fetchBeneficiaries());
        await fetchTransferData();
      } catch {
        toast.error(TRANSFER_MESSAGES.FETCH_ERROR);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [dispatch, fetchTransferData]);

  const handleTransferSuccess = (updatedBalance: number) => {
    setAccount((prev) => (prev ? { ...prev, balance: updatedBalance } : prev));
    dispatch(updateBalance(updatedBalance));
    dispatch(fetchRecentTransactions(5));
    fetchTransferData();
  };

  const isLoading = loading || benLoading;

  if (isLoading) {
    return (
      <AppLayout isAuthenticated={true}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
            <div className="space-y-4">
              <div className="bg-white border border-gray-100 rounded-xl p-5 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="h-4 bg-gray-200 rounded w-2/5" />
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-6 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-1/4 mb-4" />
                <div className="h-10 bg-gray-200 rounded w-full mb-4" />
                <div className="h-10 bg-gray-200 rounded w-full mb-4" />
                <div className="h-10 bg-gray-200 rounded w-full" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white border border-gray-100 rounded-xl p-5 animate-pulse h-40" />
              <div className="bg-white border border-gray-100 rounded-xl p-5 animate-pulse h-32" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!account) {
    return (
      <AppLayout isAuthenticated={true}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-4xl mb-3">⚠️</p>
            <p className="text-red-400 font-medium">Failed to load account data.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout isAuthenticated={true}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
        {/* Page Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center justify-center w-9 h-9 text-lg text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition"
          >←</button>
          <h2 className="ml-2 text-xl font-semibold text-gray-900">Transfer Money</h2>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          <div className="space-y-5">
            <BalanceCard account={account} />
            <TransferForm
              beneficiaries={beneficiaries}
              balance={account.balance}
              onTransferSuccess={handleTransferSuccess}
            />
          </div>
          <TransferSidebar
            recentTransfers={recentTransfers}
            dailyUsed={dailyUsed}
            dailyLimit={account.dailyLimit}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default Transfer;
