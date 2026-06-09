import axiosInstance from "./axios";
import type { BeneficiaryResponse, AddBeneficiaryPayload } from "../features/beneficiary/beneficiary.types";
import type { AxiosResponse } from "axios";

export const getBeneficiariesApi = (): Promise<AxiosResponse<BeneficiaryResponse>> => {
  return axiosInstance.get("/beneficiaries");
};

export const addBeneficiaryApi = (payload: AddBeneficiaryPayload): Promise<AxiosResponse> => {
  return axiosInstance.post("/beneficiaries", payload);
};
