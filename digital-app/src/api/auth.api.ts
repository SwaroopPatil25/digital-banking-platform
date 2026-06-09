import axiosInstance from "./axios";
import type { LoginPayload, LoginResponse, RegisterPayload } from "../types/auth.types";
import type { ProfileResponse, UpdateProfilePayload } from "../features/profile/profile.types";
import type { AxiosResponse } from "axios";

export const loginApi = (payload: LoginPayload): Promise<AxiosResponse<LoginResponse>> => {
  return axiosInstance.post("/auth/login", payload);
};

export const registerApi = (payload: RegisterPayload): Promise<AxiosResponse<{ message: string }>> => {
  return axiosInstance.post("/auth/register", payload);
};

export const getProfileApi = (): Promise<AxiosResponse<ProfileResponse>> => {
  return axiosInstance.get("/auth/profile");
};

export const updateProfileApi = (payload: UpdateProfilePayload): Promise<AxiosResponse<ProfileResponse>> => {
  return axiosInstance.put("/auth/profile", payload);
};
