import { useState } from "react";
import type React from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../shared/layout/AppLayout";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { loginUser, clearAuthError } from "../../store/slices/authSlice";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, loginError } = useAppSelector((state) => state.auth);

  type FormValues = { email: string; password: string };
  const pageName = "Log In";

  const [form, setForm] = useState<FormValues>({ email: "", password: "" });
  const [error, setError] = useState<FormValues>({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validation()) return;

    dispatch(clearAuthError());
    const result = await dispatch(loginUser({ email: form.email, password: form.password }));
    if (loginUser.fulfilled.match(result)) {
      toast.success("Login Successful");
      setTimeout(() => navigate("/dashboard"), 800);
    } else {
      toast.error(result.payload as string || "Invalid credentials");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validation = () => {
    const errorValue = { email: "", password: "" };
    if (!form.email.includes("@")) errorValue.email = "Invalid Email";
    if (form.password.length < 5) errorValue.password = "Length should be more than 5";
    setError(errorValue);
    return !errorValue.email && !errorValue.password;
  };

  const register = () => navigate("/registration");

  return (
    <AppLayout isAuthenticated={false}>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
          <h2 className="text-2xl font-bold text-center mb-6">{pageName}</h2>
          {loginError && (
            <p className="text-red-500 text-sm text-center mb-4">{loginError}</p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label style={{ textAlign: "left" }} className="block text-sm font-medium mb-1">Email: </label>
              <input
                type="email"
                placeholder="Enter Email"
                name="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <span style={{ color: "red" }}>{error.email}</span>
            </div>
            <div>
              <label style={{ textAlign: "left" }} className="block text-sm font-medium mb-1">Password: </label>
              <input
                type="password"
                placeholder="Enter Password"
                name="password"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div>
                <span style={{ color: "red" }}>{error.password}</span>
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={isLoading}
                style={{ width: "120px" }}
                className={`w-full py-2 rounded-lg text-white font-semibold transition ${
                  isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {isLoading ? "Logging in..." : "Log In"}
              </button>
              <button
                type="button"
                onClick={register}
                style={{ width: "90px", margin: "5px" }}
                className="w-full py-2 rounded-lg text-white font-semibold transition bg-blue-500 hover:bg-blue-600"
              >
                Register
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default Login;
