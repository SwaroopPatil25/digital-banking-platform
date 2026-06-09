import { useEffect } from "react";
import AccountCard from "./components/AccountCard";
import QuickActions from "./components/QuickActions";
import TransactionsTable from "./components/TransactionsTable";
import AppLayout from "../../shared/layout/AppLayout";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchDashboardData } from "../../store/slices/dashboardSlice";
import { selectFormattedBalance, selectMaskedAccountNumber, selectDashboardCounts, selectDashboardLoading, selectDashboardError, selectIsDashboardStale } from "../../store/selectors/dashboardSelectors";
import type { AccountCardProps } from "./dashboard.types";
import walletIcon from "../../assets/icons/wallet.svg";
import bankIcon from "../../assets/icons/bank.svg";
import chartIcon from "../../assets/icons/chart.svg";
import giftIcon from "../../assets/icons/gift.svg";

const DashboardSkeleton = () => (
  <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8 space-y-6 animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-64" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 h-28">
          <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
          <div className="h-6 bg-gray-200 rounded w-32" />
        </div>
      ))}
    </div>
    <div className="bg-white p-6 rounded-xl border border-gray-100 h-20" />
    <div className="bg-white p-6 rounded-xl border border-gray-100 h-64" />
  </div>
);

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { user, account, recentTransactions } = useAppSelector((state) => state.dashboard);
  const formattedBalance = useAppSelector(selectFormattedBalance);
  const maskedAccount = useAppSelector(selectMaskedAccountNumber);
  const counts = useAppSelector(selectDashboardCounts);
  const loading = useAppSelector(selectDashboardLoading);
  const error = useAppSelector(selectDashboardError);
  const isStale = useAppSelector(selectIsDashboardStale);

  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    // Only fetch if cache is stale (>60s) or no data
    if (isStale || !account) {
      dispatch(fetchDashboardData());
    }
  }, [dispatch, isStale, account]);

  if (loading) {
    return (
      <AppLayout isAuthenticated={true}>
        <div className="bg-slate-50 min-h-full">
          <DashboardSkeleton />
        </div>
      </AppLayout>
    );
  }

  if (error || !account) {
    return (
      <AppLayout isAuthenticated={true}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-4xl mb-3">⚠️</p>
            <p className="text-red-500 text-lg font-medium">Failed to load dashboard data.</p>
            <button
              onClick={() => dispatch(fetchDashboardData())}
              className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const accountCards: AccountCardProps[] = [
    { title: "Available Balance", value: formattedBalance, icon: walletIcon },
    { title: "Savings Account", value: maskedAccount, icon: bankIcon },
    { title: "Credit Score", value: String(account?.creditScore ?? "N/A"), icon: chartIcon },
    { title: "Reward Points", value: String(account?.rewardPoints ?? 0), icon: giftIcon },
  ];

  return (
    <AppLayout isAuthenticated={true}>
      <div className="bg-slate-50 min-h-full">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8 space-y-6">
          {/* Welcome Section */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome, {user?.username || "User"}</h2>
              <p className="text-sm text-gray-500 mt-0.5">Last Login: {today}</p>
            </div>
            {counts && (
              <div className="hidden md:flex gap-4">
                {counts.unreadNotifications > 0 && (
                  <span className="text-xs px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full font-medium">
                    {counts.unreadNotifications} unread alerts
                  </span>
                )}
                {counts.pendingTransfers > 0 && (
                  <span className="text-xs px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-full font-medium">
                    {counts.pendingTransfers} pending
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Account Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {accountCards.map((card) => (
              <AccountCard key={card.title} title={card.title} value={card.value} icon={card.icon} />
            ))}
          </div>

          {/* Quick Actions */}
          <QuickActions />

          {/* Transactions */}
          <TransactionsTable transactions={(Array.isArray(recentTransactions) ? recentTransactions : []).slice(0, 5)} />
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
