interface ProfileFieldProps {
  label: string;
  value: string;
  name: string;
  editable: boolean;
  type?: "text" | "tel" | "date" | "select" | "textarea";
  options?: { label: string; value: string }[];
  fullWidth?: boolean;
  onChange: (name: string, value: string) => void;
}

const ProfileField = ({ label, value, name, editable, type = "text", options, fullWidth, onChange }: ProfileFieldProps) => {
  const inputClass = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800";

  const renderInput = () => {
    if (type === "select" && options) {
      return (
        <select
          name={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          className={inputClass}
        >
          <option value="">Select</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    }

    if (type === "textarea") {
      return (
        <textarea
          name={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          rows={2}
          className={`${inputClass} resize-none`}
        />
      );
    }

    return (
      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className={inputClass}
      />
    );
  };

  return (
    <div className={`text-left ${fullWidth ? "md:col-span-2" : ""}`}>
      <label className="block text-sm text-gray-500 mb-1 text-left">{label}</label>
      {editable ? renderInput() : (
        <p className="text-sm font-medium text-gray-800 py-2 text-left">{value || "—"}</p>
      )}
    </div>
  );
};

export default ProfileField;
