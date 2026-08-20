import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SimilarTicketsList from "./SimilarTicketsList";
import { MOCK_SIMILAR_TICKETS } from "../../mockData";

describe("SimilarTicketsList", () => {
  it("renders the section label", () => {
    render(<SimilarTicketsList tickets={MOCK_SIMILAR_TICKETS} />);
    expect(screen.getByText("SIMILAR TICKETS FOUND")).toBeInTheDocument();
  });

  it("renders each ticket's id, title, status, and match percent", () => {
    render(<SimilarTicketsList tickets={MOCK_SIMILAR_TICKETS} />);
    for (const ticket of MOCK_SIMILAR_TICKETS) {
      expect(
        screen.getByText(`${ticket.id} · ${ticket.title}`)
      ).toBeInTheDocument();
      expect(screen.getByText(ticket.status)).toBeInTheDocument();
      expect(screen.getByText(`${ticket.matchPercent} match`)).toBeInTheDocument();
    }
  });
});
