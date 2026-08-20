import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import WizardStepper, { type Step } from "./WizardStepper";

const steps: Step[] = [
  { key: "input", label: "Requirement", status: "done" },
  { key: "analyze", label: "AI Analyze", status: "current" },
  { key: "draft", label: "Jira Draft", status: "upcoming" },
];

describe("WizardStepper", () => {
  it("renders a label for every step", () => {
    render(<WizardStepper steps={steps} />);
    expect(screen.getByText("Requirement")).toBeInTheDocument();
    expect(screen.getByText("AI Analyze")).toBeInTheDocument();
    expect(screen.getByText("Jira Draft")).toBeInTheDocument();
  });

  it("marks the current step distinctly from done/upcoming", () => {
    render(<WizardStepper steps={steps} />);
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveClass("wizard-stepper__item--done");
    expect(items[1]).toHaveClass("wizard-stepper__item--current");
    expect(items[2]).toHaveClass("wizard-stepper__item--upcoming");
  });

  it("renders a rejected state when provided", () => {
    const rejectedSteps: Step[] = [{ key: "input", label: "Requirement", status: "rejected" }];
    render(<WizardStepper steps={rejectedSteps} />);
    expect(screen.getByRole("listitem")).toHaveClass("wizard-stepper__item--rejected");
  });

  it("shows a checkmark for done steps and a number for others", () => {
    render(<WizardStepper steps={steps} />);
    expect(screen.getByText("✓")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
