import { useCallback } from "react";
import { useAppDispatch } from "../../../store/hooks";
import { resetSessionExpired } from "../../../store/slices/authSlice";
import { hideSessionTimeout } from "../../../store/slices/appSlice";
import { persistor } from "../../../store/store";
import { removeToken } from "../../../utils/token";

const SessionExpiredModal = () => {
  const dispatch = useAppDispatch();

  const handleRedirectToLogin = useCallback(async () => {
    // Clear all auth artifacts
    removeToken();
    localStorage.removeItem("username");
    localStorage.removeItem("user");
    sessionStorage.removeItem("session_expired");

    // Reset modal flags
    dispatch(resetSessionExpired());
    dispatch(hideSessionTimeout());

    // Purge all persisted Redux state to prevent stale sensitive data
    persistor.purge();

    // Navigate via React Router (lazy import to avoid circular dependency)
    const { router } = await import("../../../app/router");
    router.navigate("/", { replace: true });
  }, [dispatch]);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-8 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <span className="text-2xl">🔒</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Session Expired</h3>
        <p className="text-sm text-gray-500 mb-6">
          Your session has expired for security. Please log in again.
        </p>
        <button
          onClick={handleRedirectToLogin}
          className="px-6 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default SessionExpiredModal;
