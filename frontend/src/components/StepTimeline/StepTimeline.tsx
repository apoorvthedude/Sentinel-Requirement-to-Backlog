import { CheckCircle2, Circle, CircleDot, XCircle } from "lucide-react";
import "./StepTimeline.css";

export type StepStatus = "done" | "current" | "upcoming" | "rejected";

export interface Step {
  key: string;
  label: string;
  status: StepStatus;
}

interface StepTimelineProps {
  steps: Step[];
}

function StepIcon({ status }: { status: StepStatus }) {
  if (status === "done") {
    return <CheckCircle2 size={20} color="var(--color-success)" aria-hidden="true" />;
  }
  if (status === "rejected") {
    return <XCircle size={20} color="var(--color-danger)" aria-hidden="true" />;
  }
  if (status === "current") {
    return <CircleDot size={20} color="var(--color-accent)" aria-hidden="true" />;
  }
  return <Circle size={20} color="var(--color-border)" aria-hidden="true" />;
}

export default function StepTimeline({ steps }: StepTimelineProps) {
  return (
    <ol className="step-timeline" aria-label="Pipeline progress">
      {steps.map((step, index) => (
        <li key={step.key} className={`step-timeline__item step-timeline__item--${step.status}`}>
          <span className="step-timeline__icon">
            <StepIcon status={step.status} />
          </span>
          <span className="step-timeline__label">{step.label}</span>
          {index < steps.length - 1 && <span className="step-timeline__connector" />}
        </li>
      ))}
    </ol>
  );
}
