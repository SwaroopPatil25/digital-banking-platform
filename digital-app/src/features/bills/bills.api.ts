import axiosInstance from "../../api/axios";
import type { AxiosResponse } from "axios";
import type {
  AccountResponse,
  BillCategoriesResponse,
  BillPaymentPayload,
  BillPaymentResponse,
} from "./bills.types";

export const getAccountApi = (): Promise<AxiosResponse<AccountResponse>> => {
  return axiosInstance.get("/account");
};

export const getBillCategoriesApi = (): Promise<AxiosResponse<BillCategoriesResponse>> => {
  return axiosInstance.get("/bills/categories");
};

export const payBillApi = (payload: BillPaymentPayload): Promise<AxiosResponse<BillPaymentResponse>> => {
  const { referenceNumber, ...rest } = payload;
  return axiosInstance.post("/bills/pay", { ...rest, consumerNumber: referenceNumber });
};
