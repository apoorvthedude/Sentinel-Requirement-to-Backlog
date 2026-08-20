import "./WizardStepper.css";

export type StepStatus = "done" | "current" | "upcoming" | "rejected";

export interface Step {
  key: string;
  label: string;
  status: StepStatus;
}

interface WizardStepperProps {
  steps: Step[];
}

export default function WizardStepper({ steps }: WizardStepperProps) {
  return (
    <ol className="wizard-stepper" aria-label="Pipeline progress">
      {steps.map((step, index) => {
        const isDone = step.status === "done";
        const mark = isDone ? "✓" : String(index + 1);
        return (
          <li key={step.key} className={`wizard-stepper__item wizard-stepper__item--${step.status}`}>
            <span className="wizard-stepper__circle">{mark}</span>
            <span className="wizard-stepper__label">{step.label}</span>
            {index < steps.length - 1 && <span className="wizard-stepper__connector" />}
          </li>
        );
      })}
    </ol>
  );
}
