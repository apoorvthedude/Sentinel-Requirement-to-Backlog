import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import StatCard from "./StatCard";

describe("StatCard", () => {
  it("renders label, value, and delta", () => {
    render(
      <StatCard label="Requirements processed" value="38" delta="+6 this month" deltaTone="positive" />
    );
    expect(screen.getByText("Requirements processed")).toBeInTheDocument();
    expect(screen.getByText("38")).toBeInTheDocument();
    expect(screen.getByText("+6 this month")).toBeInTheDocument();
  });

  it("applies the delta tone class", () => {
    render(<StatCard label="X" value="1" delta="warn" deltaTone="warning" />);
    expect(screen.getByText("warn")).toHaveClass("stat-card__delta--warning");
  });
});
