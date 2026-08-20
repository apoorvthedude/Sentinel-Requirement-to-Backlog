import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import AcceptanceCriteriaEditor from "./AcceptanceCriteriaEditor";

const CRITERIA = [
  { id: "ac-1", text: "First criterion" },
  { id: "ac-2", text: "Second criterion" },
];

describe("AcceptanceCriteriaEditor", () => {
  it("renders each criterion's text", () => {
    render(<AcceptanceCriteriaEditor criteria={CRITERIA} onChange={() => {}} />);
    expect(screen.getByDisplayValue("First criterion")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Second criterion")).toBeInTheDocument();
  });

  it("calls onChange with an added blank criterion", async () => {
    const onChange = vi.fn();
    render(<AcceptanceCriteriaEditor criteria={CRITERIA} onChange={onChange} />);
    await userEvent.click(screen.getByText("+ Add criterion"));
    expect(onChange).toHaveBeenCalledWith([
      ...CRITERIA,
      expect.objectContaining({ text: "" }),
    ]);
  });

  it("calls onChange with the criterion removed", async () => {
    const onChange = vi.fn();
    render(<AcceptanceCriteriaEditor criteria={CRITERIA} onChange={onChange} />);
    await userEvent.click(screen.getAllByLabelText("Remove criterion")[0]);
    expect(onChange).toHaveBeenCalledWith([CRITERIA[1]]);
  });
});
