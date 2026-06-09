import { useState, useEffect, useRef } from "react";
import type { FormEvent } from "react";
import toast from "react-hot-toast";
import { payBillService } from "../bills.service";
import {
  BILLS_MESSAGES,
  BILLS_VALIDATION,
  CATEGORY_FIELD_CONFIG,
  DEFAULT_FIELD_CONFIG,
  MOBILE_REGEX,
} from "../bills.constants";
import { getBillerPlaceholder } from "../bills.categories";
import type { BillCategory, BillPaymentData } from "../bills.types";
import CategoryDropdown from "./CategoryDropdown";
import PaymentSuccessModal from "./PaymentSuccessModal";
import type { AxiosError } from "axios";

interface BillFormProps {
  categories: BillCategory[];
  balance: number;
  onPaymentSuccess: (updatedBalance: number) => void;
  selectedCategory?: string;
}

interface FormErrors {
  category?: string;
  billerName?: string;
  referenceNumber?: string;
  amount?: string;
}

const BillForm = ({ categories, balance, onPaymentSuccess, selectedCategory }: BillFormProps) => {
  const [category, setCategory] = useState("");
  const [billerName, setBillerName] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<BillPaymentData | null>(null);
  const [paidAmount, setPaidAmount] = useState(0);
  const [successCategory, setSuccessCategory] = useState("");
  const [successBiller, setSuccessBiller] = useState("");
  const billerInputRef = useRef<HTMLInputElement>(null);

  // Sync category when sidebar selection changes
  useEffect(() => {
    if (selectedCategory && selectedCategory !== category) {
      setCategory(selectedCategory);
      setReferenceNumber("");
      setBillerName("");
      setErrors({});
      setTimeout(() => billerInputRef.current?.focus(), 100);
    }
  }, [selectedCategory]);

  const fieldConfig = CATEGORY_FIELD_CONFIG[category] || DEFAULT_FIELD_CONFIG;

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    const numAmount = Number(amount);

    if (!category) newErrors.category = BILLS_VALIDATION.CATEGORY_REQUIRED;
    if (!billerName.trim()) newErrors.billerName = BILLS_VALIDATION.BILLER_REQUIRED;

    if (!referenceNumber.trim()) {
      newErrors.referenceNumber = BILLS_VALIDATION.REFERENCE_REQUIRED;
    } else if (category === "mobile") {
      if (!MOBILE_REGEX.test(referenceNumber.trim())) {
        newErrors.referenceNumber = BILLS_VALIDATION.MOBILE_INVALID;
      }
    } else if (referenceNumber.trim().length < 3) {
      newErrors.referenceNumber = BILLS_VALIDATION.REFERENCE_MIN;
    }

    if (!amount) {
      newErrors.amount = BILLS_VALIDATION.AMOUNT_REQUIRED;
    } else if (numAmount <= 0) {
      newErrors.amount = BILLS_VALIDATION.AMOUNT_POSITIVE;
    } else if (numAmount > balance) {
      newErrors.amount = BILLS_VALIDATION.AMOUNT_EXCEEDS;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const response = await payBillService({
        category,
        billerName: billerName.trim(),
        referenceNumber: referenceNumber.trim(),
        amount: Number(amount),
      });
      toast.success(BILLS_MESSAGES.PAYMENT_SUCCESS);
      setPaidAmount(Number(amount));
      setSuccessData(response.data);
      setSuccessCategory(category);
      setSuccessBiller(billerName.trim());
      onPaymentSuccess(response.data.updatedBalance);
      setCategory("");
      setBillerName("");
      setReferenceNumber("");
      setAmount("");
      // Refresh notifications
      window.dispatchEvent(new Event("refresh-notifications"));
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      const message = error.response?.data?.message;
      if (error.response?.status === 400 || message?.toLowerCase().includes("insufficient")) {
        toast.error(BILLS_MESSAGES.INSUFFICIENT_BALANCE);
      } else {
        toast.error(BILLS_MESSAGES.SERVER_ERROR);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleFieldChange = (field: keyof FormErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    setReferenceNumber("");
    handleFieldChange("category");
    setErrors((prev) => ({ ...prev, referenceNumber: undefined }));
  };

  return (
    <>
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white! mb-4">Pay Bill</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <CategoryDropdown
            categories={categories}
            value={category}
            onChange={handleCategoryChange}
            error={errors.category}
          />

          <div>
            <label style={{ textAlign: "left" }} className="block text-sm text-slate-400 mb-1">
              <span className="text-red-500">* </span>Biller Name:</label>
            <input
              ref={billerInputRef}
              type="text"
              value={billerName}
              onChange={(e) => { setBillerName(e.target.value); handleFieldChange("billerName"); }}
              placeholder={getBillerPlaceholder(category)}
              className="w-full px-3 py-2 rounded-md bg-slate-900 border border-slate-600 text-white text-sm focus:outline-none focus:border-blue-500"
            />
            {errors.billerName && <p className="text-red-400 text-xs mt-1">{errors.billerName}</p>}
          </div>

          <div>
            <label style={{ textAlign: "left" }} className="block text-sm text-slate-400 mb-1">
              <span className="text-red-500">* </span>{fieldConfig.label}:</label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => { setReferenceNumber(e.target.value); handleFieldChange("referenceNumber"); }}
              placeholder={fieldConfig.placeholder}
              className="w-full px-3 py-2 rounded-md bg-slate-900 border border-slate-600 text-white text-sm focus:outline-none focus:border-blue-500"
            />
            {errors.referenceNumber && <p className="text-red-400 text-xs mt-1">{errors.referenceNumber}</p>}
          </div>

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

          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {submitting ? "Processing..." : "Pay Bill"}
          </button>
        </form>
      </div>

      {successData && (
        <PaymentSuccessModal
          data={successData}
          amount={paidAmount}
          category={successCategory}
          billerName={successBiller}
          onClose={() => setSuccessData(null)}
        />
      )}
    </>
  );
};

export default BillForm;
