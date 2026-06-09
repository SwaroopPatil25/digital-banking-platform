import { getBeneficiariesApi, addBeneficiaryApi } from "../api/beneficiary.api";
import type { BeneficiaryResponse, AddBeneficiaryPayload } from "../features/beneficiary/beneficiary.types";

export const getBeneficiariesService = async (): Promise<BeneficiaryResponse> => {
  const response = await getBeneficiariesApi();
  const data = response.data as any;
  const items = data?.beneficiaries || data?.data?.beneficiaries || data?.data?.items || data?.data || [];
  return {
    success: data?.success ?? false,
    beneficiaries: Array.isArray(items) ? items : [],
  };
};

export const addBeneficiaryService = async (payload: AddBeneficiaryPayload): Promise<void> => {
  await addBeneficiaryApi(payload);
};
