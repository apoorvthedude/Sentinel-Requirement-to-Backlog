import type { Step, StepStatus } from "../components/StepTimeline";

export const STEP_ORDER = [
  { key: "input", label: "Requirement" },
  { key: "analyze", label: "AI Analyze" },
  { key: "draft", label: "Jira Draft" },
  { key: "approve", label: "Approve" },
] as const;

export type StepKey = (typeof STEP_ORDER)[number]["key"];

export function buildSteps(currentKey: StepKey, rejected = false): Step[] {
  const currentIndex = STEP_ORDER.findIndex((s) => s.key === currentKey);

  return STEP_ORDER.map((step, index): Step => {
    let status: StepStatus;
    if (rejected && index === currentIndex) {
      status = "rejected";
    } else if (index < currentIndex) {
      status = "done";
    } else if (index === currentIndex) {
      status = "current";
    } else {
      status = "upcoming";
    }
    return { key: step.key, label: step.label, status };
  });
}
