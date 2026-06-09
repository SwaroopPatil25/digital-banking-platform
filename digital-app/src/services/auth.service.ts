import { loginApi, registerApi, getProfileApi, updateProfileApi } from "../api/auth.api";
import type { LoginPayload, LoginResponse, RegisterPayload } from "../types/auth.types";
import type { ProfileResponse, UpdateProfilePayload } from "../features/profile/profile.types";
import { setToken } from "../utils/token";

export const loginService = async (payload: LoginPayload): Promise<LoginResponse> => {
  const response = await loginApi(payload);
  const { token, user, message } = response.data;
  setToken(token);
  localStorage.setItem("username", user.username);
  return { token, user, message };
};

export const registerService = async (payload: RegisterPayload): Promise<{ message: string }> => {
  const response = await registerApi(payload);
  return response.data;
};

export const getProfileService = async (): Promise<ProfileResponse> => {
  const response = await getProfileApi();
  const data = response.data as any;
  return {
    ...data,
    user: data?.user || data?.data?.user || data?.data || null,
  };
};

export const updateProfileService = async (payload: UpdateProfilePayload): Promise<ProfileResponse> => {
  const response = await updateProfileApi(payload);
  return response.data;
};
