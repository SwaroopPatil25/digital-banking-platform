import type { DashboardNotification } from "../../../types/dashboard.types";

interface NotificationsProps {
  notifications: DashboardNotification[];
}

const Notifications = ({ notifications }: NotificationsProps) => {
  const list = Array.isArray(notifications) ? notifications : [];

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Notifications</h3>
      {list.length === 0 ? (
        <p className="text-sm text-gray-500">No notifications</p>
      ) : (
        <div className="space-y-3">
          {list.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-lg text-sm ${
                item.type === "warning"
                  ? "bg-yellow-50 text-yellow-800 border border-yellow-200"
                  : "bg-blue-50 text-blue-800 border border-blue-200"
              }`}
            >
              {item.type === "warning" ? "⚠️" : "ℹ️"} {item.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
