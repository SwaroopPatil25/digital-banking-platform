import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { loginApi } from "../../api/auth.api";
import type { LoginPayload, User } from "../../types/auth.types";
import { setToken, removeToken } from "../../utils/token";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginError: string | null;
  sessionExpired: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  loginError: null,
  sessionExpired: false,
};

export const loginUser = createAsyncThunk<
  { token: string; user: User },
  LoginPayload,
  { rejectValue: string }
>("auth/loginUser", async (payload, { rejectWithValue }) => {
  try {
    const response = await loginApi(payload);
    const { token, user } = response.data;
    setToken(token);
    localStorage.setItem("username", user.username);
    return { token, user };
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } };
    return rejectWithValue(error.response?.data?.message || "Invalid credentials");
  }
});

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  removeToken();
  localStorage.removeItem("username");
  localStorage.removeItem("user");
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSessionExpired(state) {
      state.sessionExpired = true;
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
    },
    clearAuthError(state) {
      state.loginError = null;
    },
    resetSessionExpired(state) {
      state.sessionExpired = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.loginError = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<{ token: string; user: User }>) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.loginError = null;
        state.sessionExpired = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.loginError = action.payload || "Login failed";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        state.sessionExpired = false;
      });
  },
});

export const { setSessionExpired, clearAuthError, resetSessionExpired } = authSlice.actions;
export default authSlice.reducer;
