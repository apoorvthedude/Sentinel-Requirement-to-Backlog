import type { SimilarTicket } from "../../mockData";
import "./SimilarTicketsList.css";

interface SimilarTicketsListProps {
  tickets: SimilarTicket[];
}

export default function SimilarTicketsList({ tickets }: SimilarTicketsListProps) {
  return (
    <div className="similar-tickets">
      <div className="similar-tickets__label">SIMILAR TICKETS FOUND</div>
      {tickets.map((ticket) => (
        <div key={ticket.id} className="similar-tickets__row">
          <div className="similar-tickets__info">
            <span className="similar-tickets__title">
              {ticket.id} · {ticket.title}
            </span>
            <span className="similar-tickets__status">{ticket.status}</span>
          </div>
          <span className="similar-tickets__match">{ticket.matchPercent} match</span>
        </div>
      ))}
    </div>
  );
}
