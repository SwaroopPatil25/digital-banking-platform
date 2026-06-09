import type { NotificationData } from "../profile.types";
import bellIcon from "../../../assets/icons/bell.svg";

interface NotificationPreferencesProps {
  data: NotificationData;
}

const NotificationPreferences = ({ data }: NotificationPreferencesProps) => {
  const options: { key: keyof NotificationData; label: string }[] = [
    { key: "emailAlerts", label: "Email Alerts" },
    { key: "smsAlerts", label: "SMS Alerts" },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 h-full">
      <div className="flex items-center gap-2 mb-4">
        <img src={bellIcon} alt="Notifications" className="w-5 h-5" />
        <h3 className="text-lg font-semibold text-gray-800 text-left">Notifications</h3>
      </div>
      <div className="space-y-4">
        {options.map((opt) => (
          <div key={opt.key} className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-700">{opt.label}</span>
            <div className={`w-10 h-5 rounded-full relative ${data[opt.key] ? "bg-green-500" : "bg-gray-300"}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${data[opt.key] ? "right-0.5" : "left-0.5"}`} />
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-4">Preferences managed by bank settings.</p>
    </div>
  );
};

export default NotificationPreferences;
