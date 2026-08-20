import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import StatusPill from "./StatusPill";

describe("StatusPill", () => {
  it("renders the label", () => {
    render(<StatusPill label="Created" tone="success" />);
    expect(screen.getByText("Created")).toBeInTheDocument();
  });

  it("applies the tone class", () => {
    render(<StatusPill label="Pending" tone="warning" />);
    expect(screen.getByText("Pending")).toHaveClass("status-pill--warning");
  });
});
