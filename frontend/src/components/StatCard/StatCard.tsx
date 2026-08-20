import type { DeltaTone } from "../../mockData";
import "./StatCard.css";

interface StatCardProps {
  label: string;
  value: string;
  delta: string;
  deltaTone: DeltaTone;
}

export default function StatCard({ label, value, delta, deltaTone }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value">{value}</div>
      <div className={`stat-card__delta stat-card__delta--${deltaTone}`}>{delta}</div>
    </div>
  );
}
