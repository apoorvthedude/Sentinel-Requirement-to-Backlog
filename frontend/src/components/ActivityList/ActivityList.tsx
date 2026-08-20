import type { ActivityItem } from "../../mockData";
import "./ActivityList.css";

interface ActivityListProps {
  items: ActivityItem[];
}

export default function ActivityList({ items }: ActivityListProps) {
  return (
    <div className="activity-list">
      <div className="activity-list__header">Recent activity</div>
      {items.map((item, index) => (
        <div className="activity-list__row" key={index}>
          <span className="activity-list__text">{item.text}</span>
          <span className="activity-list__time">{item.time}</span>
        </div>
      ))}
    </div>
  );
}
