import "./PulsingDots.css";

interface PulsingDotsProps {
  label: string;
  sublabel?: string;
}

export default function PulsingDots({ label, sublabel }: PulsingDotsProps) {
  return (
    <div className="pulsing-dots" role="status" aria-live="polite">
      <div className="pulsing-dots__row">
        <span className="pulsing-dots__dot" />
        <span className="pulsing-dots__dot" />
        <span className="pulsing-dots__dot" />
      </div>
      <span className="pulsing-dots__label">{label}</span>
      {sublabel && <span className="pulsing-dots__sublabel">{sublabel}</span>}
    </div>
  );
}
