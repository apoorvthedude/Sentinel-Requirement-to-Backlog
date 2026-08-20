import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import IssueTypePicker from "./IssueTypePicker";

describe("IssueTypePicker", () => {
  it("renders all three issue types with the active one highlighted", () => {
    render(<IssueTypePicker value="Story" onChange={() => {}} />);
    expect(screen.getByText("Story")).toHaveClass("issue-type-picker__option--active");
    expect(screen.getByText("Task")).not.toHaveClass("issue-type-picker__option--active");
    expect(screen.getByText("Epic")).not.toHaveClass("issue-type-picker__option--active");
  });

  it("calls onChange with the clicked type", async () => {
    const onChange = vi.fn();
    render(<IssueTypePicker value="Story" onChange={onChange} />);
    await userEvent.click(screen.getByText("Epic"));
    expect(onChange).toHaveBeenCalledWith("Epic");
  });
});
