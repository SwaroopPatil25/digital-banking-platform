import { getAccountApi, getBillCategoriesApi, payBillApi } from "./bills.api";
import type {
  AccountResponse,
  BillCategoriesResponse,
  BillPaymentPayload,
  BillPaymentResponse,
} from "./bills.types";

export const getAccountService = async (): Promise<AccountResponse> => {
  const response = await getAccountApi();
  const data = response.data as any;
  return {
    success: data?.success ?? false,
    account: data?.account || data?.data?.account || data?.data || null,
  };
};

export const getBillCategoriesService = async (): Promise<BillCategoriesResponse> => {
  const response = await getBillCategoriesApi();
  const data = response.data as any;
  const items = data?.categories || data?.data?.categories || data?.data || [];
  return {
    success: data?.success ?? false,
    categories: Array.isArray(items) ? items : [],
  };
};

export const payBillService = async (payload: BillPaymentPayload): Promise<BillPaymentResponse> => {
  const response = await payBillApi(payload);
  return response.data;
};
