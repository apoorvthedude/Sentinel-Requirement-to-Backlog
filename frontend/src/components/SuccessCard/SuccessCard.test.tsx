import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import SuccessCard from "./SuccessCard";

describe("SuccessCard", () => {
  it("renders the ticket id and title", () => {
    render(
      <SuccessCard ticketId="PROJ-1284" title="Improve dashboard search" onNewRequirement={() => {}} />
    );
    expect(screen.getByText("PROJ-1284 · Improve dashboard search")).toBeInTheDocument();
    expect(screen.getByText("Story created in Jira")).toBeInTheDocument();
  });

  it("calls onNewRequirement when clicked", async () => {
    const onNewRequirement = vi.fn();
    render(
      <SuccessCard ticketId="PROJ-1284" title="Improve dashboard search" onNewRequirement={onNewRequirement} />
    );
    await userEvent.click(screen.getByText("New requirement"));
    expect(onNewRequirement).toHaveBeenCalled();
  });
});
