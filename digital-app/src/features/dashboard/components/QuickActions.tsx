import { useNavigate } from "react-router-dom";
import { quickActions } from "../dashboard.constants";

const QuickActions = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-base font-semibold text-gray-800 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {quickActions.map((action) => (
          <button
            key={action.label}
            className="flex flex-col items-center gap-2.5 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-blue-50 hover:border-blue-200 hover:shadow-sm transition-all duration-200"
            onClick={() => navigate(action.route)}
          >
            <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 flex items-center justify-center shadow-sm">
              <img src={action.icon} alt={action.label} className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-gray-700">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
