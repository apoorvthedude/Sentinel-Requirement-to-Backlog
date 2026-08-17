import "./ChaseLoader.css";

interface ChaseLoaderProps {
  label?: string;
}

function CatSilhouette() {
  return (
    <svg viewBox="0 0 64 40" className="chase-loader__cat" aria-hidden="true">
      <path
        d="M4 34c0-10 6-18 16-20l-2-8 8 6c4-1 8-1 12 0l8-6-2 8c10 2 16 10 16 20
           0 4-3 6-8 6H12c-5 0-8-2-8-6z"
        fill="currentColor"
      />
      <circle cx="20" cy="24" r="2" fill="var(--color-bg)" />
      <circle cx="32" cy="24" r="2" fill="var(--color-bg)" />
    </svg>
  );
}

function MouseSilhouette() {
  return (
    <svg viewBox="0 0 40 28" className="chase-loader__mouse" aria-hidden="true">
      <ellipse cx="16" cy="16" rx="14" ry="10" fill="currentColor" />
      <circle cx="6" cy="6" r="5" fill="currentColor" />
      <circle cx="16" cy="4" r="5" fill="currentColor" />
      <path
        d="M30 16c6 0 9 4 9 4s-3 1-6-1"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="10" cy="14" r="1.5" fill="var(--color-bg)" />
    </svg>
  );
}

export default function ChaseLoader({ label = "Analyzing your requirement…" }: ChaseLoaderProps) {
  return (
    <div className="chase-loader" role="status" aria-live="polite">
      <div className="chase-loader__track">
        <div className="chase-loader__runner">
          <MouseSilhouette />
          <CatSilhouette />
        </div>
      </div>
      <p className="chase-loader__label">{label}</p>
    </div>
  );
}
