import type { SecurityData } from "../profile.types";
import shieldIcon from "../../../assets/icons/shield.svg";

interface SecuritySettingsProps {
  data: SecurityData;
}

const SecuritySettings = ({ data }: SecuritySettingsProps) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 h-full">
      <div className="flex items-center gap-2 mb-4">
        <img src={shieldIcon} alt="Security" className="w-5 h-5" />
        <h3 className="text-lg font-semibold text-gray-800 text-left">Security</h3>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-gray-700">Multi-Factor Authentication</span>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${data.mfaEnabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
            {data.mfaEnabled ? "Enabled" : "Disabled"}
          </span>
        </div>
        <div className="flex items-center justify-between py-2 border-t border-gray-50">
          <div>
            <span className="text-sm text-gray-700 block">Password</span>
            <span className="text-xs text-gray-400">Last updated: Not available</span>
          </div>
        </div>
      </div>
      <div className="flex gap-3 mt-5">
        <button
          disabled
          className="px-4 py-2 text-xs font-medium rounded-lg border border-gray-200 text-gray-400 cursor-not-allowed"
          title="Coming soon"
        >
          Change Password
        </button>
        <button
          disabled
          className="px-4 py-2 text-xs font-medium rounded-lg border border-gray-200 text-gray-400 cursor-not-allowed"
          title="Coming soon"
        >
          Manage Security
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-3">Advanced security options coming soon.</p>
    </div>
  );
};

export default SecuritySettings;
