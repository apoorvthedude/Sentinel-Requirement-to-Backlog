import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ChildStoryCard from "./ChildStoryCard";

const STORY = {
  id: "child-1",
  title: "Add debounced search",
  description: "Fire queries after a pause.",
  points: "3",
  priority: "Medium" as const,
};

describe("ChildStoryCard", () => {
  it("renders title, description, points, and priority", () => {
    render(<ChildStoryCard story={STORY} onChange={() => {}} onRemove={() => {}} />);
    expect(screen.getByDisplayValue("Add debounced search")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Fire queries after a pause.")).toBeInTheDocument();
    expect(screen.getByDisplayValue("3 pts")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Medium")).toBeInTheDocument();
  });

  it("calls onRemove when the remove button is clicked", async () => {
    const onRemove = vi.fn();
    render(<ChildStoryCard story={STORY} onChange={() => {}} onRemove={onRemove} />);
    await userEvent.click(screen.getByLabelText("Remove story"));
    expect(onRemove).toHaveBeenCalled();
  });
});
