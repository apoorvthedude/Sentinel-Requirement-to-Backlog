import "./SuccessCard.css";

interface SuccessCardProps {
  ticketId: string;
  title: string;
  onNewRequirement: () => void;
}

export default function SuccessCard({ ticketId, title, onNewRequirement }: SuccessCardProps) {
  return (
    <div className="success-card">
      <div className="success-card__icon">✓</div>
      <h2 className="success-card__heading">Story created in Jira</h2>
      <p className="success-card__subtitle">
        {ticketId} · {title}
      </p>
      <div className="success-card__actions">
        <button type="button" className="success-card__open-btn">
          Open in Jira
        </button>
        <button type="button" className="success-card__new-btn" onClick={onNewRequirement}>
          New requirement
        </button>
      </div>
    </div>
  );
}
