import { useNavigate } from "react-router-dom";
import { getToken, isAuthenticated, removeToken } from "../utils/token";
import toast from "react-hot-toast";

export const useAuth = () => {
  const navigate = useNavigate();

  const isLoggedIn = isAuthenticated();
  const token = getToken();
  const username = localStorage.getItem("username") || "User";

  const logout = () => {
    removeToken();
    localStorage.removeItem("username");
    toast.success("Logged out successfully");
    navigate("/");
  };

  return { isLoggedIn, token, username, logout };
};
