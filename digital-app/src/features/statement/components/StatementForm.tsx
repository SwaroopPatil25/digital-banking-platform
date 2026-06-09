import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import toast from "react-hot-toast";
import { downloadStatementService } from "../statement.service";
import {
  STATEMENT_MESSAGES,
  STATEMENT_VALIDATION,
  FORMAT_OPTIONS,
} from "../statement.constants";
import type { StatementFormat } from "../statement.types";
import type { AxiosError } from "axios";
import { saveDownloadHistory } from "../../../shared/widgets/StatementSidebar";

interface StatementFormProps {
  prefillFrom?: string;
  prefillTo?: string;
}

interface FormErrors {
  fromDate?: string;
  toDate?: string;
  format?: string;
}

const StatementForm = ({ prefillFrom, prefillTo }: StatementFormProps) => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [format, setFormat] = useState<StatementFormat>("pdf");
  const [errors, setErrors] = useState<FormErrors>({});
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (prefillFrom) setFromDate(prefillFrom);
    if (prefillTo) setToDate(prefillTo);
  }, [prefillFrom, prefillTo]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!fromDate) newErrors.fromDate = STATEMENT_VALIDATION.FROM_DATE_REQUIRED;
    if (!toDate) newErrors.toDate = STATEMENT_VALIDATION.TO_DATE_REQUIRED;
    if (fromDate && toDate && fromDate > toDate) {
      newErrors.fromDate = STATEMENT_VALIDATION.DATE_RANGE_INVALID;
    }
    if (!format) newErrors.format = STATEMENT_VALIDATION.FORMAT_REQUIRED;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDownload = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setDownloading(true);
    try {
      const blob = await downloadStatementService({ fromDate, toDate, format });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `statement.${format}`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      toast.success(STATEMENT_MESSAGES.DOWNLOAD_SUCCESS);
      saveDownloadHistory(format);
    } catch (err) {
      const error = err as AxiosError;
      const status = error.response?.status;
      if (status === 404) {
        toast.error(STATEMENT_MESSAGES.NO_TRANSACTIONS);
      } else if (status === 400) {
        toast.error(STATEMENT_MESSAGES.INVALID_DATE);
      } else {
        toast.error(STATEMENT_MESSAGES.DOWNLOAD_ERROR);
      }
    } finally {
      setDownloading(false);
    }
  };

  const handleFieldChange = (field: keyof FormErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white! mb-4">Select Date Range</h3>
      <form onSubmit={handleDownload} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label style={{ textAlign: "left" }} className="block text-sm text-slate-400 mb-1"> 
              <span className="text-red-500">* </span>From Date: </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); handleFieldChange("fromDate"); }}
              className="w-full px-3 py-2 rounded-md bg-slate-900 border border-slate-600 text-white text-sm focus:outline-none focus:border-blue-500"
            />
            {errors.fromDate && <p className="text-red-400 text-xs mt-1">{errors.fromDate}</p>}
          </div>
          <div>
            <label style={{ textAlign: "left" }} className="block text-sm text-slate-400 mb-1"> 
              <span className="text-red-500">* </span>To Date:</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); handleFieldChange("toDate"); }}
              className="w-full px-3 py-2 rounded-md bg-slate-900 border border-slate-600 text-white text-sm focus:outline-none focus:border-blue-500"
            />
            {errors.toDate && <p className="text-red-400 text-xs mt-1">{errors.toDate}</p>}
          </div>
        </div>

        <div>
          <label style={{ textAlign: "left" }} className="block text-sm text-slate-400 mb-1"> 
            <span className="text-red-500">* </span>Format:</label>
          <select
            value={format}
            onChange={(e) => { setFormat(e.target.value as StatementFormat); handleFieldChange("format"); }}
            className="w-full px-3 py-2 rounded-md bg-slate-900 border border-slate-600 text-white text-sm focus:outline-none focus:border-blue-500"
          >
            {FORMAT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {errors.format && <p className="text-red-400 text-xs mt-1">{errors.format}</p>}
        </div>

        <button
          type="submit"
          disabled={downloading}
          className="px-5 py-2.5 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {downloading ? "Downloading..." : "Download Statement"}
        </button>
      </form>
    </div>
  );
};

export default StatementForm;
