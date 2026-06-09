import { getAccountApi, getBeneficiariesApi, transferMoneyApi } from "./transfer.api";
import type {
  AccountResponse,
  BeneficiaryListResponse,
  TransferPayload,
  TransferResponse,
} from "./transfer.types";

export const getAccountService = async (): Promise<AccountResponse> => {
  const response = await getAccountApi();
  const data = response.data as any;
  return {
    success: data?.success ?? false,
    account: data?.account || data?.data?.account || data?.data || null,
  };
};

export const getBeneficiariesService = async (): Promise<BeneficiaryListResponse> => {
  const response = await getBeneficiariesApi();
  const data = response.data as any;
  const items = data?.beneficiaries || data?.data?.beneficiaries || data?.data?.items || data?.data || [];
  return {
    success: data?.success ?? false,
    beneficiaries: Array.isArray(items) ? items : [],
  };
};

export const transferMoneyService = async (payload: TransferPayload): Promise<TransferResponse> => {
  const response = await transferMoneyApi(payload);
  const data = response.data;
  return {
    success: data?.success ?? false,
    message: data?.message || "",
    data: data?.data || data,
  };
};
