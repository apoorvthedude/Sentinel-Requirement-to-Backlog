import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import HistoryPage from "./HistoryPage";

describe("HistoryPage", () => {
  it("renders all mock rows", () => {
    render(
      <MemoryRouter>
        <HistoryPage />
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { name: "History" })).toBeInTheDocument();
    expect(
      screen.getByText("Improve dashboard search for faster item discovery")
    ).toBeInTheDocument();
    expect(screen.getByText("Allow CSV import of team rosters")).toBeInTheDocument();
  });
});
