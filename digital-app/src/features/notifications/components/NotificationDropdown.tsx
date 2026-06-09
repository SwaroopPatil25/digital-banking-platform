import type { Notification } from "../notification.types";
import NotificationItem from "./NotificationItem";

interface NotificationDropdownProps {
  notifications: Notification[];
  onRead: (id: string) => void;
  onMarkAllRead: () => void;
}

const NotificationDropdown = ({ notifications, onRead, onMarkAllRead }: NotificationDropdownProps) => {
  const list = Array.isArray(notifications) ? notifications : [];
  const hasUnread = list.some((n) => !n.isRead);

  return (
    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <h4 className="text-sm font-semibold text-white">Notifications</h4>
        {hasUnread && (
          <button
            onClick={onMarkAllRead}
            className="text-xs text-blue-400 hover:text-blue-300 transition"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto">
        {list.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-2xl mb-2">🔔</p>
            <p className="text-sm text-slate-500">No notifications</p>
            <p className="text-xs text-slate-600 mt-0.5">You're all caught up!</p>
          </div>
        ) : (
          list.map((n) => (
            <NotificationItem key={n._id} notification={n} onRead={onRead} />
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
