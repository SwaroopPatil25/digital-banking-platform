import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logoutUser } from "../../store/slices/authSlice";
import digibankLogo from "../../assets/logo/digibank-logo.svg";
import NotificationBell from "../../features/notifications/components/NotificationBell";
import toast from "react-hot-toast";

interface HeaderProps {
  isAuthenticated: boolean;
}

const Header = ({ isAuthenticated }: HeaderProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const username =
  useAppSelector(
    (state) =>
      state.auth?.user?.username
  ) ||
  localStorage.getItem("username") ||
  "User";

  const handleLogout = () => {
    dispatch(logoutUser());
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <header className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white border-b border-slate-700/50 shadow-lg">
      <div className="w-full mx-auto h-16 px-6 lg:px-10 flex justify-between items-center">
        {/* Brand */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          <img src={digibankLogo} alt="DigiBank" className="h-9 w-9" />
          <span className="text-xl font-bold tracking-tight text-white hidden sm:block">
            DigiBank
          </span>
        </div>

        {/* Nav Actions */}
        {isAuthenticated && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400 hidden md:block">
              Welcome, <span className="text-slate-200 font-medium">{username}</span>
            </span>

            <NotificationBell />

            <button
              onClick={() => navigate("/profile")}
              className="px-3.5 py-1.5 text-sm font-medium rounded-md bg-slate-700/60 text-slate-200 border border-slate-600/50 hover:bg-slate-700 hover:text-white transition"
            >
              Profile
            </button>

            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 text-sm font-medium rounded-md text-red-300 border border-red-500/30 hover:bg-red-500/10 hover:border-red-400/50 transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
