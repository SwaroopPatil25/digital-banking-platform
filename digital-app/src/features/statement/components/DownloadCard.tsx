import documentIcon from "../../../assets/icons/document.svg";

const DownloadCard = () => {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
      <div className="flex items-center gap-3 mb-3">
        <img src={documentIcon} alt="Statement" className="w-7 h-7 invert" />
        <h3 className="text-lg font-semibold text-white!">Download Statement</h3>
      </div>
      <p className="text-sm text-slate-400 mb-2">
        Download your bank account statement in your preferred format.
      </p>
      <div className="flex gap-2 text-xs text-slate-500">
        <span className="px-2 py-1 bg-slate-700 rounded">PDF</span>
        <span className="px-2 py-1 bg-slate-700 rounded">CSV</span>
      </div>
      <p className="text-xs text-slate-500 mt-3">
        Generate statement for selected date range.
      </p>
    </div>
  );
};

export default DownloadCard;
