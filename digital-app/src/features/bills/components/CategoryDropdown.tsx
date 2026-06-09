import type { BillCategory } from "../bills.types";

interface CategoryDropdownProps {
  categories: BillCategory[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const CategoryDropdown = ({ categories, value, onChange, error }: CategoryDropdownProps) => {
  const list = Array.isArray(categories) ? categories : [];

  return (
    <div>
      <label style={{ textAlign: "left" }} className="block text-sm text-slate-400 mb-1"> 
              <span className="text-red-500">* </span>Bill Category:</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-md bg-slate-900 border border-slate-600 text-white text-sm focus:outline-none focus:border-blue-500"
      >
        <option value="">Select category</option>
        {list.map((cat) => (
          <option key={cat.value} value={cat.value}>
            {cat.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default CategoryDropdown;
