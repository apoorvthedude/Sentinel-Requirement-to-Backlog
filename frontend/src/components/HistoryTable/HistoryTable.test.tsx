import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HistoryTable from "./HistoryTable";
import type { HistoryRow } from "../../mockData";

const rows: HistoryRow[] = [
  { title: "Row one", status: "Created", ticket: "PROJ-1", date: "Aug 1" },
  { title: "Row two", status: "Pending Approval", ticket: "—", date: "Aug 2" },
];

describe("HistoryTable", () => {
  it("renders the header and all rows", () => {
    render(<HistoryTable rows={rows} />);
    expect(screen.getByText("REQUIREMENT")).toBeInTheDocument();
    expect(screen.getByText("Row one")).toBeInTheDocument();
    expect(screen.getByText("Row two")).toBeInTheDocument();
    expect(screen.getByText("PROJ-1")).toBeInTheDocument();
  });

  it("maps status to the correct pill tone", () => {
    render(<HistoryTable rows={rows} />);
    expect(screen.getByText("Created")).toHaveClass("status-pill--success");
    expect(screen.getByText("Pending Approval")).toHaveClass("status-pill--warning");
  });
});
