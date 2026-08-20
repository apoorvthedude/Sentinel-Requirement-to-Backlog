import "./DuplicateTicketCard.css";

export type DuplicateChoice = "new" | "existing";

interface DuplicateTicketCardProps {
  ticketId: string;
  choice: DuplicateChoice;
  onChange: (choice: DuplicateChoice) => void;
}

export default function DuplicateTicketCard({
  ticketId,
  choice,
  onChange,
}: DuplicateTicketCardProps) {
  return (
    <div className="duplicate-ticket-card">
      <div className="duplicate-ticket-card__title">Possible duplicate</div>
      <label className="duplicate-ticket-card__option">
        <input
          type="radio"
          name="duplicate-choice"
          checked={choice === "new"}
          onChange={() => onChange("new")}
        />
        Create as a new story
      </label>
      <label className="duplicate-ticket-card__option">
        <input
          type="radio"
          name="duplicate-choice"
          checked={choice === "existing"}
          onChange={() => onChange("existing")}
        />
        Update existing ticket {ticketId} instead
      </label>
    </div>
  );
}
