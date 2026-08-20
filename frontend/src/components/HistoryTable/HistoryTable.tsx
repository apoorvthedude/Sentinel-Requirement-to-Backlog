import StatusPill, { type StatusPillTone } from "../StatusPill";
import type { HistoryRow, HistoryStatus } from "../../mockData";
import "./HistoryTable.css";

interface HistoryTableProps {
  rows: HistoryRow[];
}

const STATUS_TONE: Record<HistoryStatus, StatusPillTone> = {
  Created: "success",
  "Pending Approval": "warning",
  Draft: "neutral",
};

export default function HistoryTable({ rows }: HistoryTableProps) {
  return (
    <div className="history-table">
      <div className="history-table__header">
        <span>REQUIREMENT</span>
        <span>STATUS</span>
        <span>TICKET</span>
        <span>DATE</span>
      </div>
      {rows.map((row) => (
        <div className="history-table__row" key={row.title}>
          <span className="history-table__title">{row.title}</span>
          <span className="history-table__status">
            <StatusPill label={row.status} tone={STATUS_TONE[row.status]} />
          </span>
          <span className="history-table__ticket">{row.ticket}</span>
          <span className="history-table__date">{row.date}</span>
        </div>
      ))}
    </div>
  );
}
