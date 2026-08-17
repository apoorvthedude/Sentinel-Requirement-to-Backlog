import { describe, expect, it } from "vitest";
import { buildSteps } from "./steps";

describe("buildSteps", () => {
  it("marks steps before the current key as done", () => {
    const steps = buildSteps("draft");
    expect(steps.find((s) => s.key === "input")?.status).toBe("done");
    expect(steps.find((s) => s.key === "analyze")?.status).toBe("done");
  });

  it("marks the given key as current", () => {
    const steps = buildSteps("draft");
    expect(steps.find((s) => s.key === "draft")?.status).toBe("current");
  });

  it("marks steps after the current key as upcoming", () => {
    const steps = buildSteps("draft");
    expect(steps.find((s) => s.key === "approve")?.status).toBe("upcoming");
  });

  it("marks the current step as rejected when rejected=true", () => {
    const steps = buildSteps("analyze", true);
    expect(steps.find((s) => s.key === "analyze")?.status).toBe("rejected");
    expect(steps.find((s) => s.key === "input")?.status).toBe("done");
  });
});
