import { useEffect } from "react";
import AppLayout from "../../shared/layout/AppLayout";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchActivityHistory, setActivityFilters, clearActivityFilters } from "../../store/slices/activitySlice";
import Pagination from "../../shared/components/Pagination";
import { formatDateTime } from "../../utils/dateFormatter";
import { useDebounce } from "../../hooks/useDebounce";
import { getActivityIcon, EMPTY_STATE_ICON } from "./activityIcons";

const ACTIVITY_TYPES = [
  { label: "All Activities", value: "" },
  { label: "Login", value: "LOGIN" },
  { label: "Logout", value: "LOGOUT" },
  { label: "Transfer", value: "TRANSFER" },
  { label: "Bill Payment", value: "BILL_PAYMENT" },
  { label: "Beneficiary Added", value: "BENEFICIARY_ADDED" },
  { label: "Profile Update", value: "PROFILE_UPDATE" },
  { label: "Password Change", value: "PASSWORD_CHANGE" },
  { label: "Statement Download", value: "STATEMENT_DOWNLOAD" },
];

const Activity = () => {
  const dispatch = useAppDispatch();
  const { activities, pagination, filters, loading } = useAppSelector((state) => state.activity);
  const navigate = useNavigate();
  const debouncedSearch = useDebounce(filters.search, 400);

  useEffect(() => {
    dispatch(fetchActivityHistory({ page: 1, debouncedSearch }));
  }, [dispatch, filters.action, filters.date, debouncedSearch]);

  const handlePageChange = (page: number) => {
    dispatch(fetchActivityHistory({ page, debouncedSearch }));
  };

  return (
    <AppLayout isAuthenticated={true}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button onClick={() => navigate("/dashboard")} className="flex items-center justify-center w-9 h-9 text-lg text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition">←</button>
          <h2 className="ml-2 text-xl font-semibold text-gray-900">Activity History</h2>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <input
            type="text"
            value={filters.search}
            onChange={(e) => dispatch(setActivityFilters({ search: e.target.value }))}
            placeholder="Search activities..."
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
          />
          <select
            value={filters.action}
            onChange={(e) => dispatch(setActivityFilters({ action: e.target.value }))}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
          >
            {ACTIVITY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => dispatch(setActivityFilters({ date: e.target.value }))}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
          />
          {(filters.search || filters.action || filters.date) && (
            <button
              onClick={() => dispatch(clearActivityFilters())}
              className="px-3 py-2 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition"
            >
              Clear
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-4">
                <div className="w-9 h-9 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/5" />
                </div>
                <div className="h-3 bg-gray-200 rounded w-24" />
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <img src={EMPTY_STATE_ICON} alt="No activity" className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-gray-500 text-sm font-medium">No activity found</p>
            <p className="text-gray-400 text-xs mt-1">Your account activity will appear here</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-50">
              {activities.map((activity) => (
                <div key={activity._id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0 p-2">
                    <img
                      src={getActivityIcon(activity.action)}
                      alt={activity.action}
                      className="w-5 h-5 opacity-70"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {activity.action?.replace(/_/g, " ")}
                      {activity.ipAddress && <span className="ml-2">• IP: {activity.ipAddress}</span>}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 shrink-0">{formatDateTime(activity.createdAt)}</span>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-gray-100">
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
    </AppLayout>
  );
};

export default Activity;
