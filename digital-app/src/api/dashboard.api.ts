import axiosInstance from "./axios";
import type { DashboardResponse } from "../types/dashboard.types";
import type { AxiosResponse } from "axios";

export const getDashboardApi = (): Promise<AxiosResponse<DashboardResponse>> => {
  return axiosInstance.get("/dashboard");
};
