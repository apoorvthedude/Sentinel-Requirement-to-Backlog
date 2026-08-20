import "./ReadOnlyField.css";

interface ReadOnlyFieldProps {
  label: string;
  value: string;
}

export default function ReadOnlyField({ label, value }: ReadOnlyFieldProps) {
  return (
    <div className="readonly-field">
      <label className="readonly-field__label">{label}</label>
      <input className="readonly-field__input" value={value} readOnly />
    </div>
  );
}
