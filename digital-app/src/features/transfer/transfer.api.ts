import axiosInstance from "../../api/axios";
import type { AxiosResponse } from "axios";
import type {
  AccountResponse,
  BeneficiaryListResponse,
  TransferPayload,
  TransferResponse,
} from "./transfer.types";

export const getAccountApi = (): Promise<AxiosResponse<AccountResponse>> => {
  return axiosInstance.get("/account");
};

export const getBeneficiariesApi = (): Promise<AxiosResponse<BeneficiaryListResponse>> => {
  return axiosInstance.get("/beneficiaries");
};

export const transferMoneyApi = (payload: TransferPayload): Promise<AxiosResponse<TransferResponse>> => {
  const { idempotencyKey, ...body } = payload;
  return axiosInstance.post("/transfer", body, {
    headers: idempotencyKey ? { "X-Idempotency-Key": idempotencyKey } : {},
  });
};
