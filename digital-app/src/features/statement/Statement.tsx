import { useEffect, useState } from "react";
import AppLayout from "../../shared/layout/AppLayout";
import DownloadCard from "./components/DownloadCard";
import StatementForm from "./components/StatementForm";
import StatementSkeleton from "./components/StatementSkeleton";
import StatementSidebar from "../../shared/widgets/StatementSidebar";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axios";

interface StatementMeta {
  _id: string;
  month: string;
  year: number;
  transactionCount: number;
  generatedAt: string;
  format: string;
}

const Statement = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [statements, setStatements] = useState<StatementMeta[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await axiosInstance.get("/statement/metadata");
        const data = res.data;
        const items = data?.statements || data?.data?.statements || data?.data || [];
        setStatements(Array.isArray(items) ? items : []);
      } catch {
        // Non-critical — metadata is optional
      } finally {
        setLoading(false);
      }
    };
    fetchMeta();
  }, []);

  const handleDateSelect = (from: string, to: string) => {
    setDateRange({ from, to });
  };

  if (loading) {
    return (
      <AppLayout isAuthenticated={true}>
        <StatementSkeleton />
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
          <h2 className="ml-2 text-xl font-semibold text-gray-900">Download Statement</h2>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          <div className="space-y-5">
            <DownloadCard />
            <StatementForm prefillFrom={dateRange.from} prefillTo={dateRange.to} />

            {/* Monthly Statements Metadata */}
            {statements.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h4 className="text-sm font-semibold text-gray-800 mb-4">Available Statements</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {statements.slice(0, 6).map((s) => (
                    <div key={s._id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{s.month} {s.year}</p>
                        <p className="text-xs text-gray-500">{s.transactionCount} transactions • {s.format?.toUpperCase()}</p>
                      </div>
                      <span className="text-xs text-gray-400">{s.generatedAt ? new Date(s.generatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {statements.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                <p className="text-2xl mb-2">📄</p>
                <p className="text-sm text-gray-500">No previous statements available</p>
                <p className="text-xs text-gray-400 mt-1">Generate your first statement using the form above</p>
              </div>
            )}
          </div>
          <StatementSidebar onDateSelect={handleDateSelect} />
        </div>
      </div>
    </AppLayout>
  );
};

export default Statement;
