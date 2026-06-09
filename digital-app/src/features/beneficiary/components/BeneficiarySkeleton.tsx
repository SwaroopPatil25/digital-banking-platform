const BeneficiarySkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-slate-800 border border-slate-700 rounded-lg p-5 animate-pulse"
        >
          <div className="h-5 bg-slate-700 rounded w-3/4 mb-3" />
          <div className="h-4 bg-slate-700 rounded w-1/2 mb-2" />
          <div className="h-4 bg-slate-700 rounded w-2/3 mb-2" />
          <div className="h-4 bg-slate-700 rounded w-1/3" />
        </div>
      ))}
    </div>
  );
};

export default BeneficiarySkeleton;
