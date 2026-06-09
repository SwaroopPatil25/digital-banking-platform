const BillsSkeleton = () => {
  return (
    <div className="max-w-3xl mx-auto px-8 py-8 space-y-4">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-1/3 mb-3" />
        <div className="h-8 bg-slate-700 rounded w-1/2 mb-3" />
        <div className="h-4 bg-slate-700 rounded w-2/5" />
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 animate-pulse">
        <div className="h-5 bg-slate-700 rounded w-1/4 mb-4" />
        <div className="h-10 bg-slate-700 rounded w-full mb-4" />
        <div className="h-10 bg-slate-700 rounded w-full mb-4" />
        <div className="h-10 bg-slate-700 rounded w-full mb-4" />
        <div className="h-10 bg-slate-700 rounded w-full mb-4" />
        <div className="h-10 bg-slate-700 rounded w-1/3" />
      </div>
    </div>
  );
};

export default BillsSkeleton;
