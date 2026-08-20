import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PulsingDots from "./PulsingDots";

describe("PulsingDots", () => {
  it("renders the label and has role=status", () => {
    render(<PulsingDots label="Analyzing your requirement…" />);
    expect(screen.getByText("Analyzing your requirement…")).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders the sublabel when provided", () => {
    render(<PulsingDots label="Analyzing…" sublabel="Checking backlog overlap" />);
    expect(screen.getByText("Checking backlog overlap")).toBeInTheDocument();
  });

  it("omits the sublabel when not provided", () => {
    render(<PulsingDots label="Analyzing…" />);
    expect(screen.queryByText("Checking backlog overlap")).not.toBeInTheDocument();
  });
});
