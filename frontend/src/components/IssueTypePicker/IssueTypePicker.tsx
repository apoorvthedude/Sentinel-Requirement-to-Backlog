import "./IssueTypePicker.css";

export type IssueType = "Story" | "Task" | "Epic";

const ISSUE_TYPES: IssueType[] = ["Story", "Task", "Epic"];

interface IssueTypePickerProps {
  value: IssueType;
  onChange: (value: IssueType) => void;
}

export default function IssueTypePicker({ value, onChange }: IssueTypePickerProps) {
  return (
    <div className="issue-type-picker">
      {ISSUE_TYPES.map((type) => (
        <button
          key={type}
          type="button"
          className={`issue-type-picker__option${
            value === type ? " issue-type-picker__option--active" : ""
          }`}
          onClick={() => onChange(type)}
        >
          {type}
        </button>
      ))}
    </div>
  );
}
