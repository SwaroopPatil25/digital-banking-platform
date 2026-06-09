import { useState, useRef } from "react";
import type { FormEvent } from "react";
import toast from "react-hot-toast";
import type { TransferBeneficiary, TransferResponseData } from "../transfer.types";
import { TRANSFER_MESSAGES, TRANSFER_VALIDATION } from "../transfer.constants";
import { transferMoneyService } from "../transfer.service";
import BeneficiaryDropdown from "./BeneficiaryDropdown";
import TransferSuccessModal from "./TransferSuccessModal";
import ConfirmModal from "../../../shared/components/modals/ConfirmModal";
import { getBfsiErrorMessage } from "../../../api/axios";

interface TransferFormProps {
  beneficiaries: TransferBeneficiary[];
  balance: number;
  onTransferSuccess: (updatedBalance: number) => void;
}

interface FormErrors {
  beneficiaryId?: string;
  amount?: string;
  remarks?: string;
}

type Step = "form" | "review" | "processing";

const TransferForm = ({ beneficiaries, balance, onTransferSuccess }: TransferFormProps) => {
  const [beneficiaryId, setBeneficiaryId] = useState("");
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<TransferResponseData | null>(null);
  const [transferredAmount, setTransferredAmount] = useState(0);
  const [step, setStep] = useState<Step>("form");
  const idempotencyRef = useRef<string>("");

  const safeBeneficiaries = Array.isArray(beneficiaries) ? beneficiaries : [];
  const selectedBeneficiary = safeBeneficiaries.find((b) => b._id === beneficiaryId);

  const isBeneficiaryPending = selectedBeneficiary?.status === "PENDING_APPROVAL";

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    const numAmount = Number(amount);

    if (!beneficiaryId) newErrors.beneficiaryId = TRANSFER_VALIDATION.BENEFICIARY_REQUIRED;
    if (!amount) newErrors.amount = TRANSFER_VALIDATION.AMOUNT_REQUIRED;
    else if (numAmount <= 0) newErrors.amount = TRANSFER_VALIDATION.AMOUNT_POSITIVE;
    else if (numAmount > balance) newErrors.amount = TRANSFER_VALIDATION.AMOUNT_EXCEEDS;
    if (!remarks.trim()) newErrors.remarks = TRANSFER_VALIDATION.REMARKS_REQUIRED;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReview = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    // Generate idempotency key for this transfer attempt
    idempotencyRef.current = `txn_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    setStep("review");
  };

  const handleConfirmTransfer = async () => {
    setStep("processing");
    setSubmitting(true);
    try {
      const response = await transferMoneyService({
        beneficiaryId,
        amount: Number(amount),
        remarks: remarks.trim(),
        idempotencyKey: idempotencyRef.current,
      });
      toast.success(TRANSFER_MESSAGES.SUCCESS);
      setTransferredAmount(Number(amount));
      setSuccessData(response.data);
      onTransferSuccess(response.data.updatedBalance);
      setBeneficiaryId("");
      setAmount("");
      setRemarks("");
      setStep("form");
      window.dispatchEvent(new Event("refresh-notifications"));
    } catch (err) {
      const message = getBfsiErrorMessage(err);
      toast.error(message);
      setStep("form");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFieldChange = (field: keyof FormErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const maskAccount = (acc: string) => acc ? "XXXX" + acc.slice(-4) : "";

  return (
    <>
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white! mb-4">Transfer Money</h3>

        {step === "processing" && (
          <div className="flex flex-col items-center py-12">
            <div className="w-10 h-10 border-4 border-blue-400/30 border-t-blue-500 rounded-full animate-spin mb-4" />
            <p className="text-sm text-slate-400">Processing your transfer...</p>
            <p className="text-xs text-slate-500 mt-1">Please do not close this page</p>
          </div>
        )}

        {step === "form" && (
          <form onSubmit={handleReview} className="space-y-4">
            <BeneficiaryDropdown
              beneficiaries={safeBeneficiaries}
              value={beneficiaryId}
              onChange={(id) => { setBeneficiaryId(id); handleFieldChange("beneficiaryId"); }}
              error={errors.beneficiaryId}
            />

            {isBeneficiaryPending && (
              <div className="flex items-start gap-2 p-3 bg-amber-900/30 border border-amber-700/50 rounded-lg">
                <span className="text-amber-400 text-sm">⏳</span>
                <div>
                  <p className="text-xs text-amber-300 font-medium">Cooling Period Active</p>
                  <p className="text-xs text-amber-400/80 mt-0.5">{TRANSFER_MESSAGES.BENEFICIARY_PENDING}</p>
                </div>
              </div>
            )}

            <div>
              <label style={{ textAlign: "left" }} className="block text-sm text-slate-400 mb-1">
                <span className="text-red-500">* </span>Amount (₹):</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); handleFieldChange("amount"); }}
                placeholder="Enter amount"
                className="w-full px-3 py-2 rounded-md bg-slate-900 border border-slate-600 text-white text-sm focus:outline-none focus:border-blue-500"
              />
              {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount}</p>}
            </div>

            <div>
              <label style={{ textAlign: "left" }} className="block text-sm text-slate-400 mb-1">
                <span className="text-red-500">* </span>Remarks:</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => { setRemarks(e.target.value); handleFieldChange("remarks"); }}
                placeholder="e.g. Rent, EMI, Payment"
                className="w-full px-3 py-2 rounded-md bg-slate-900 border border-slate-600 text-white text-sm focus:outline-none focus:border-blue-500"
              />
              {errors.remarks && <p className="text-red-400 text-xs mt-1">{errors.remarks}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting || safeBeneficiaries.length === 0 || isBeneficiaryPending}
              className="px-5 py-2.5 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition"
            >
              Review Transfer
            </button>
          </form>
        )}
      </div>

      {/* Confirmation Modal */}
      {step === "review" && selectedBeneficiary && (
        <ConfirmModal
          title="Confirm Transfer"
          confirmLabel="Transfer Money"
          onConfirm={handleConfirmTransfer}
          onCancel={() => setStep("form")}
          loading={submitting}
        >
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Beneficiary</span>
              <span className="font-medium text-gray-900">{selectedBeneficiary.beneficiaryName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Account</span>
              <span className="font-medium text-gray-900 font-mono text-xs">{maskAccount(selectedBeneficiary.accountNumber)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Bank</span>
              <span className="font-medium text-gray-900">{selectedBeneficiary.bankName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Amount</span>
              <span className="font-semibold text-gray-900">₹{Number(amount).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Remarks</span>
              <span className="font-medium text-gray-900">{remarks}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Charges</span>
              <span className="font-medium text-emerald-600">₹0 (Free)</span>
            </div>
          </div>
        </ConfirmModal>
      )}

      {successData && (
        <TransferSuccessModal
          data={successData}
          amount={transferredAmount}
          onClose={() => setSuccessData(null)}
        />
      )}
    </>
  );
};

export default TransferForm;
