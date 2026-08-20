import "./StatusPill.css";

export type StatusPillTone = "success" | "warning" | "neutral" | "accent";

interface StatusPillProps {
  label: string;
  tone: StatusPillTone;
}

export default function StatusPill({ label, tone }: StatusPillProps) {
  return <span className={`status-pill status-pill--${tone}`}>{label}</span>;
}
