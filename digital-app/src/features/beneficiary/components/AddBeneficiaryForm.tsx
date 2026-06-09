import { useState } from "react";
import type { FormEvent } from "react";
import {
  BENEFICIARY_VALIDATION,
  IFSC_REGEX,
} from "../beneficiary.constants";
import type { AddBeneficiaryPayload } from "../beneficiary.types";

interface AddBeneficiaryFormProps {
  onSuccess: (payload: AddBeneficiaryPayload) => void;
  onCancel: () => void;
}

interface FormErrors {
  beneficiaryName?: string;
  accountNumber?: string;
  confirmAccountNumber?: string;
  bankName?: string;
  ifscCode?: string;
}

const  AddBeneficiaryForm = ({ onSuccess, onCancel }: AddBeneficiaryFormProps) => {
  const [form, setForm] = useState({
    beneficiaryName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    bankName: "",
    ifscCode: "",
    nickname: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.beneficiaryName.trim()) {
      newErrors.beneficiaryName = BENEFICIARY_VALIDATION.NAME_REQUIRED;
    } else if (form.beneficiaryName.trim().length < 3) {
      newErrors.beneficiaryName = BENEFICIARY_VALIDATION.NAME_MIN;
    }

    if (!form.accountNumber) {
      newErrors.accountNumber = BENEFICIARY_VALIDATION.ACCOUNT_REQUIRED;
    } else if (!/^\d+$/.test(form.accountNumber)) {
      newErrors.accountNumber = BENEFICIARY_VALIDATION.ACCOUNT_DIGITS;
    } else if (form.accountNumber.length < 8) {
      newErrors.accountNumber = BENEFICIARY_VALIDATION.ACCOUNT_MIN;
    }

    if (form.accountNumber !== form.confirmAccountNumber) {
      newErrors.confirmAccountNumber = BENEFICIARY_VALIDATION.ACCOUNT_MISMATCH;
    }

    if (!form.bankName.trim()) {
      newErrors.bankName = BENEFICIARY_VALIDATION.BANK_REQUIRED;
    }

    if (!form.ifscCode.trim()) {
      newErrors.ifscCode = BENEFICIARY_VALIDATION.IFSC_REQUIRED;
    } else if (!IFSC_REGEX.test(form.ifscCode.trim())) {
      newErrors.ifscCode = BENEFICIARY_VALIDATION.IFSC_INVALID;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: AddBeneficiaryPayload = {
      beneficiaryName: form.beneficiaryName.trim(),
      accountNumber: form.accountNumber,
      bankName: form.bankName.trim(),
      ifscCode: form.ifscCode.trim(),
      ...(form.nickname.trim() && { nickname: form.nickname.trim() }),
    };
    setSubmitting(true);
    await onSuccess(payload);
    setSubmitting(false);
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-white! mb-4">Add Beneficiary</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Beneficiary Name */}
        <div>
          <label style={{ textAlign: "left" }} className="block text-sm text-slate-400 mb-1"><span className="text-red-500">* </span> Beneficiary Name:</label>
          <input
            type="text"
            value={form.beneficiaryName}
            onChange={(e) => handleChange("beneficiaryName", e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-slate-900 border border-slate-600 text-white text-sm focus:outline-none focus:border-blue-500"
          />
          {errors.beneficiaryName && <p className="text-red-400 text-xs mt-1">{errors.beneficiaryName}</p>}
        </div>

        {/* Bank Name */}
        <div>
          <label style={{ textAlign: "left" }} className="block text-sm text-slate-400 mb-1"> <span className="text-red-500">* </span> Bank Name:</label>
          <input
            type="text"
            value={form.bankName}
            onChange={(e) => handleChange("bankName", e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-slate-900 border border-slate-600 text-white text-sm focus:outline-none focus:border-blue-500"
          />
          {errors.bankName && <p className="text-red-400 text-xs mt-1">{errors.bankName}</p>}
        </div>

        {/* Account Number */}
        <div>
          <label style={{ textAlign: "left" }} className="block text-sm text-slate-400 mb-1"> <span className="text-red-500">* </span>Account Number:</label>
          <input
            type="text"
            value={form.accountNumber}
            onChange={(e) => handleChange("accountNumber", e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-slate-900 border border-slate-600 text-white text-sm focus:outline-none focus:border-blue-500"
          />
          {errors.accountNumber && <p className="text-red-400 text-xs mt-1">{errors.accountNumber}</p>}
        </div>

        {/* Confirm Account Number */}
        <div>
          <label style={{ textAlign: "left" }} className="block text-sm text-slate-400 mb-1"> <span className="text-red-500">* </span>Confirm Account Number:</label>
          <input
            type="text"
            value={form.confirmAccountNumber}
            onChange={(e) => handleChange("confirmAccountNumber", e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-slate-900 border border-slate-600 text-white text-sm focus:outline-none focus:border-blue-500"
          />
          {errors.confirmAccountNumber && <p className="text-red-400 text-xs mt-1">{errors.confirmAccountNumber}</p>}
        </div>

        {/* IFSC Code */}
        <div>
          <label style={{ textAlign: "left" }} className="block text-sm text-slate-400 mb-1"> <span className="text-red-500">* </span>IFSC Code:</label>
          <input
            type="text"
            value={form.ifscCode}
            onChange={(e) => handleChange("ifscCode", e.target.value.toUpperCase())}
            className="w-full px-3 py-2 rounded-md bg-slate-900 border border-slate-600 text-white text-sm focus:outline-none focus:border-blue-500"
          />
          {errors.ifscCode && <p className="text-red-400 text-xs mt-1">{errors.ifscCode}</p>}
        </div>

        {/* Nickname */}
        <div>
          <label className="flex text-sm text-slate-400 mb-1">Nickname (optional)</label>
          <input
            type="text"
            value={form.nickname}
            onChange={(e) => handleChange("nickname", e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-slate-900 border border-slate-600 text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Actions */}
        <div className="md:col-span-2 flex gap-3 mt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {submitting ? "Adding..." : "Add Beneficiary"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-medium rounded-md border border-slate-600 text-slate-300 hover:bg-slate-700 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBeneficiaryForm;
