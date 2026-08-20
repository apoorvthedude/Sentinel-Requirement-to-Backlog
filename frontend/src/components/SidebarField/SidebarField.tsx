import "./SidebarField.css";

interface SidebarFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

export default function SidebarField({ label, value, onChange, options }: SidebarFieldProps) {
  return (
    <div className="sidebar-field">
      <label className="sidebar-field__label">{label}</label>
      <select
        className="sidebar-field__select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
