import { BILL_CATEGORY_CONFIG } from "../../features/bills/bills.categories";

interface SavedBiller {
  billerName: string;
  category: string;
}

interface BillsSidebarProps {
  savedBillers?: SavedBiller[];
  selectedCategory?: string;
  onCategorySelect?: (value: string) => void;
}

const BillsSidebar = ({ savedBillers = [], selectedCategory, onCategorySelect }: BillsSidebarProps) => {
  return (
    <div className="space-y-5">
      {/* Quick Categories */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">Quick Categories</h4>
        <div className="grid grid-cols-4 gap-2">
          {BILL_CATEGORY_CONFIG.map((cat) => {
            const isActive = selectedCategory === cat.value;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategorySelect?.(cat.value)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg cursor-pointer transition-all duration-200 border ${
                  isActive
                    ? "bg-blue-50 border-blue-300 shadow-sm"
                    : "border-transparent hover:bg-gray-50"
                }`}
              >
                <span className="text-lg">{cat.icon}</span>
                <span className={`text-[10px] text-center leading-tight font-medium ${isActive ? "text-blue-700" : "text-gray-600"}`}>
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Saved Billers */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">Saved Billers</h4>
        {savedBillers.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">No saved billers yet</p>
        ) : (
          <div className="space-y-3">
            {savedBillers.slice(0, 5).map((b, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-800">{b.billerName}</p>
                  <p className="text-[10px] text-gray-500 capitalize">{b.category}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-amber-50 rounded-xl border border-amber-100 p-5">
        <h4 className="text-sm font-semibold text-amber-800 mb-3">Bill Payment Tips</h4>
        <ul className="space-y-2 text-xs text-amber-700">
          <li className="flex gap-2"><span>•</span>Pay before due date to avoid penalties</li>
          <li className="flex gap-2"><span>•</span>Verify consumer number before payment</li>
          <li className="flex gap-2"><span>•</span>Keep transaction ID for reference</li>
        </ul>
      </div>
    </div>
  );
};

export default BillsSidebar;
