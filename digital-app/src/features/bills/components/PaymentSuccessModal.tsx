import type { BillPaymentData } from "../bills.types";
import checkCircleIcon from "../../../assets/icons/check-circle.svg";
import StatusBadge from "../../../shared/components/StatusBadge";
import { formatDateTime } from "../../../utils/dateFormatter";

interface PaymentSuccessModalProps {
  data: BillPaymentData;
  amount: number;
  category?: string;
  billerName?: string;
  onClose: () => void;
}

const PaymentSuccessModal = ({ data, amount, category, billerName, onClose }: PaymentSuccessModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 max-w-sm w-full mx-4 text-center">
        <img src={checkCircleIcon} alt="Success" className="w-14 h-14 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Bill Payment Successful</h3>
        {data.status && (
          <div className="mb-4">
            <StatusBadge status={data.status} />
          </div>
        )}
        <div className="space-y-2 text-sm text-slate-400 mb-6 text-left">
          {data.referenceNumber && (
            <div className="flex justify-between">
              <span className="text-slate-500">Ref No:</span>
              <span className="text-white font-medium font-mono text-xs">{data.referenceNumber}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-500">Amount Paid:</span>
            <span className="text-white font-medium">₹{amount.toLocaleString("en-IN")}</span>
          </div>
          {category && (
            <div className="flex justify-between">
              <span className="text-slate-500">Category:</span>
              <span className="text-white font-medium capitalize">{category}</span>
            </div>
          )}
          {billerName && (
            <div className="flex justify-between">
              <span className="text-slate-500">Biller:</span>
              <span className="text-white font-medium">{billerName}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-500">Updated Balance:</span>
            <span className="text-white font-medium">₹{data.updatedBalance.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Transaction ID:</span>
            <span className="text-white font-medium text-xs font-mono">{data.transactionId}</span>
          </div>
          {data.timestamp && (
            <div className="flex justify-between">
              <span className="text-slate-500">Time:</span>
              <span className="text-white font-medium text-xs">{formatDateTime(data.timestamp)}</span>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="px-6 py-2.5 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccessModal;
