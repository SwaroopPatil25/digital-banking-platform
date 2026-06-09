export type BeneficiaryStatus = "ACTIVE" | "PENDING_APPROVAL" | "BLOCKED";

export interface Beneficiary {
  _id: string;
  beneficiaryName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  createdAt: string;
  status?: BeneficiaryStatus;
  activationDate?: string;
}

export interface BeneficiaryResponse {
  success: boolean;
  beneficiaries: Beneficiary[];
}

export interface AddBeneficiaryPayload {
  beneficiaryName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  nickname?: string;
}
