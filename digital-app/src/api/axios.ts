import axios from "axios";
import { getToken, removeToken } from "../utils/token";
import toast from "react-hot-toast";
import { ENV } from "../config/env";

const axiosInstance = axios.create({
  baseURL: ENV.API_URL,
  timeout: ENV.REQUEST_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor — attach JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor — handle errors centrally
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const errorCode = error.response?.data?.errorCode || error.response?.data?.code;

    if (status === 401) {
      removeToken();
      localStorage.removeItem("username");
      localStorage.removeItem("user");

      const alreadyRedirecting = sessionStorage.getItem("session_expired");
      if (!alreadyRedirecting) {
        sessionStorage.setItem("session_expired", "true");
        // Dispatch Redux session expiry (lazy import to avoid circular dependency)
        const { store } = await import("../store/store");
        const { setSessionExpired } = await import("../store/slices/authSlice");
        const { showSessionTimeout } = await import("../store/slices/appSlice");
        store.dispatch(setSessionExpired());
        store.dispatch(showSessionTimeout());
      }
    } else if (status === 429) {
      toast.error("Too many requests. Please wait before trying again.");
    } else if (status === 403) {
      toast.error("Access denied.");
    } else if (status === 409 && errorCode === "DUPLICATE_REQUEST") {
      toast.error("This transaction was already processed.");
    } else if (status === 500) {
      toast.error("Server error. Please try again later.");
    } else if (!error.response) {
      toast.error("Network error. Check your connection.");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

/** Maps BFSI error codes to user-friendly messages */
export const BFSI_ERROR_MAP: Record<string, string> = {
  TRANSFER_LIMIT_EXCEEDED: "Daily transfer limit reached. Please try tomorrow.",
  BENEFICIARY_PENDING: "Beneficiary not yet activated. Security cooling period in progress.",
  FRAUD_RISK_DETECTED: "Transaction flagged for verification. Please contact support.",
  DUPLICATE_REQUEST: "This transaction was already processed.",
  INSUFFICIENT_BALANCE: "Insufficient balance for this transaction.",
  BENEFICIARY_BLOCKED: "This beneficiary is blocked. Contact support.",
  RATE_LIMIT_EXCEEDED: "Please wait before trying again.",
};

export const getBfsiErrorMessage = (error: unknown): string => {
  if (!axios.isAxiosError(error)) return "Something went wrong. Please try again.";
  const code = error.response?.data?.errorCode || error.response?.data?.code;
  const msg = error.response?.data?.message;
  if (code && BFSI_ERROR_MAP[code]) return BFSI_ERROR_MAP[code];
  if (msg) return msg;
  return "Something went wrong. Please try again.";
};
