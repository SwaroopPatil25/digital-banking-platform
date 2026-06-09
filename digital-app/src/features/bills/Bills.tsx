import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AppLayout from "../../shared/layout/AppLayout";
import { getAccountService, getBillCategoriesService } from "./bills.service";
import { BILLS_MESSAGES } from "./bills.constants";
import type { Account, BillCategory } from "./bills.types";
import BalanceCard from "./components/BalanceCard";
import BillForm from "./components/BillForm";
import BillsSkeleton from "./components/BillsSkeleton";
import BillsSidebar from "../../shared/widgets/BillsSidebar";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axios";
import { useAppDispatch } from "../../store/hooks";
import { updateBalance } from "../../store/slices/dashboardSlice";

interface BillTransaction {
  description: string;
  category?: string;
  type: string;
}

const Bills = () => {
  const [account, setAccount] = useState<Account | null>(null);
  const [categories, setCategories] = useState<BillCategory[]>([]);
  const [savedBillers, setSavedBillers] = useState<{ billerName: string; category: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accountRes, categoriesRes] = await Promise.all([
          getAccountService(),
          getBillCategoriesService(),
        ]);
        setAccount(accountRes?.account || null);
        setCategories(Array.isArray(categoriesRes?.categories) ? categoriesRes.categories : []);

        try {
          const txnRes = await axiosInstance.get<{ success: boolean; transactions?: BillTransaction[]; data?: BillTransaction[] }>("/transactions", { params: { category: "BILL_PAYMENT", limit: 5 } });
          const allTxns = txnRes.data?.transactions || txnRes.data?.data || [];
          const billers = (Array.isArray(allTxns) ? allTxns : [])
            .filter((t) => t.type === "bill_payment" || t.type === "debit" || t.description?.toLowerCase().includes("bill"))
            .slice(0, 5)
            .map((t) => ({ billerName: t.description, category: t.category || "bill" }));
          setSavedBillers(billers);
        } catch {
          // Non-critical
        }
      } catch {
        toast.error(BILLS_MESSAGES.FETCH_ERROR);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePaymentSuccess = (updatedBalance: number) => {
    setAccount((prev) => (prev ? { ...prev, balance: updatedBalance } : prev));
    dispatch(updateBalance(updatedBalance));
  };

  if (loading) {
    return (
      <AppLayout isAuthenticated={true}>
        <BillsSkeleton />
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
          <h2 className="ml-2 text-xl font-semibold text-gray-900">Pay Bills</h2>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          <div className="space-y-5">
            <BalanceCard account={account} />
            <BillForm
              categories={categories}
              balance={account.balance}
              onPaymentSuccess={handlePaymentSuccess}
              selectedCategory={selectedCategory}
            />
          </div>
          <BillsSidebar
            savedBillers={savedBillers}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default Bills;
