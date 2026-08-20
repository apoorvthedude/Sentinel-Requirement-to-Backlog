import type { ChildStory } from "../../mockData";
import "./ChildStoryCard.css";

const POINTS_OPTIONS = ["1", "2", "3", "5", "8"];
const PRIORITY_OPTIONS: ChildStory["priority"][] = ["Low", "Medium", "High"];

interface ChildStoryCardProps {
  story: ChildStory;
  onChange: (story: ChildStory) => void;
  onRemove: () => void;
}

export default function ChildStoryCard({ story, onChange, onRemove }: ChildStoryCardProps) {
  return (
    <div className="child-story-card">
      <div className="child-story-card__title-row">
        <input
          className="child-story-card__title"
          value={story.title}
          onChange={(e) => onChange({ ...story, title: e.target.value })}
        />
        <button
          type="button"
          className="child-story-card__remove"
          onClick={onRemove}
          aria-label="Remove story"
        >
          ×
        </button>
      </div>
      <textarea
        className="child-story-card__description"
        value={story.description}
        onChange={(e) => onChange({ ...story, description: e.target.value })}
      />
      <div className="child-story-card__meta-row">
        <select
          className="child-story-card__select"
          value={story.points}
          onChange={(e) => onChange({ ...story, points: e.target.value })}
        >
          {POINTS_OPTIONS.map((pt) => (
            <option key={pt} value={pt}>
              {pt} pt{pt === "1" ? "" : "s"}
            </option>
          ))}
        </select>
        <select
          className="child-story-card__select"
          value={story.priority}
          onChange={(e) =>
            onChange({ ...story, priority: e.target.value as ChildStory["priority"] })
          }
        >
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
