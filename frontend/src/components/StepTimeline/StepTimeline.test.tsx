import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import StepTimeline, { type Step } from "./StepTimeline";

const steps: Step[] = [
  { key: "input", label: "Requirement", status: "done" },
  { key: "analyze", label: "AI Analyze", status: "current" },
  { key: "draft", label: "Jira Draft", status: "upcoming" },
];

describe("StepTimeline", () => {
  it("renders a label for every step", () => {
    render(<StepTimeline steps={steps} />);
    expect(screen.getByText("Requirement")).toBeInTheDocument();
    expect(screen.getByText("AI Analyze")).toBeInTheDocument();
    expect(screen.getByText("Jira Draft")).toBeInTheDocument();
  });

  it("marks the current step distinctly from done/upcoming", () => {
    render(<StepTimeline steps={steps} />);
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveClass("step-timeline__item--done");
    expect(items[1]).toHaveClass("step-timeline__item--current");
    expect(items[2]).toHaveClass("step-timeline__item--upcoming");
  });

  it("renders a rejected state when provided", () => {
    const rejectedSteps: Step[] = [{ key: "input", label: "Requirement", status: "rejected" }];
    render(<StepTimeline steps={rejectedSteps} />);
    expect(screen.getByRole("listitem")).toHaveClass("step-timeline__item--rejected");
  });
});
