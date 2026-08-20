import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import DuplicateTicketCard from "./DuplicateTicketCard";

describe("DuplicateTicketCard", () => {
  it("renders the ticket id in the existing-ticket option", () => {
    render(
      <DuplicateTicketCard ticketId="PROJ-482" choice="new" onChange={() => {}} />
    );
    expect(screen.getByText("Update existing ticket PROJ-482 instead")).toBeInTheDocument();
  });

  it("checks the option matching the current choice", () => {
    render(
      <DuplicateTicketCard ticketId="PROJ-482" choice="existing" onChange={() => {}} />
    );
    expect(screen.getByText("Create as a new story").closest("label")?.querySelector("input")).not.toBeChecked();
    expect(
      screen.getByText("Update existing ticket PROJ-482 instead").closest("label")?.querySelector("input")
    ).toBeChecked();
  });

  it("calls onChange with the selected choice", async () => {
    const onChange = vi.fn();
    render(
      <DuplicateTicketCard ticketId="PROJ-482" choice="new" onChange={onChange} />
    );
    await userEvent.click(screen.getByText("Update existing ticket PROJ-482 instead"));
    expect(onChange).toHaveBeenCalledWith("existing");
  });
});
