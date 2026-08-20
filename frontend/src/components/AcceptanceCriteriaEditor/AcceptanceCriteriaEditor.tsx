import type { AcceptanceCriterion } from "../../mockData";
import "./AcceptanceCriteriaEditor.css";

interface AcceptanceCriteriaEditorProps {
  criteria: AcceptanceCriterion[];
  onChange: (criteria: AcceptanceCriterion[]) => void;
}

export default function AcceptanceCriteriaEditor({
  criteria,
  onChange,
}: AcceptanceCriteriaEditorProps) {
  function setText(id: string, text: string) {
    onChange(criteria.map((c) => (c.id === id ? { ...c, text } : c)));
  }

  function remove(id: string) {
    onChange(criteria.filter((c) => c.id !== id));
  }

  function add() {
    onChange([...criteria, { id: crypto.randomUUID(), text: "" }]);
  }

  return (
    <div className="acceptance-criteria-editor">
      <label className="acceptance-criteria-editor__label">Acceptance criteria</label>
      <div className="acceptance-criteria-editor__list">
        {criteria.map((criterion) => (
          <div key={criterion.id} className="acceptance-criteria-editor__row">
            <input
              className="acceptance-criteria-editor__input"
              value={criterion.text}
              onChange={(e) => setText(criterion.id, e.target.value)}
            />
            <button
              type="button"
              className="acceptance-criteria-editor__remove"
              onClick={() => remove(criterion.id)}
              aria-label="Remove criterion"
            >
              ×
            </button>
          </div>
        ))}
        <button type="button" className="acceptance-criteria-editor__add" onClick={add}>
          + Add criterion
        </button>
      </div>
    </div>
  );
}
