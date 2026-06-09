import type { Notification } from "../notification.types";

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  transaction: "💸",
  fraud: "🚨",
  kyc: "🪪",
  system: "⚙️",
  transfer: "💸",
  large_transfer: "⚠️",
  security: "🔒",
};

const PRIORITY_STYLE: Record<string, string> = {
  high: "border-l-red-400",
  medium: "border-l-amber-400",
  low: "border-l-transparent",
};

const formatTime = (dateStr: string): string => {
  if (!dateStr) return "";
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const NotificationItem = ({ notification, onRead }: NotificationItemProps) => {
  const icon = CATEGORY_ICONS[notification.category || "system"] || "📌";
  const priorityBorder = PRIORITY_STYLE[notification.priority || "low"] || "";

  return (
    <button
      onClick={() => !notification.isRead && onRead(notification._id)}
      className={`w-full text-left px-4 py-3 border-b border-slate-700 last:border-0 border-l-4 transition ${priorityBorder} ${
        notification.isRead ? "bg-slate-800" : "bg-slate-700/50 hover:bg-slate-700"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <span className="text-base mt-0.5 shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          {!notification.isRead && (
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5 align-middle" />
          )}
          <p className="text-sm text-slate-200 inline">{notification.message}</p>
          <p className="text-xs text-slate-500 mt-1">{formatTime(notification.createdAt)}</p>
        </div>
      </div>
    </button>
  );
};

export default NotificationItem;
