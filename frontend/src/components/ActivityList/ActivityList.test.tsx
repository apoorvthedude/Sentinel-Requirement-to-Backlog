import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ActivityList from "./ActivityList";

describe("ActivityList", () => {
  it("renders all item texts and times in order", () => {
    render(
      <ActivityList
        items={[
          { text: "First event", time: "1h ago" },
          { text: "Second event", time: "2h ago" },
        ]}
      />
    );
    expect(screen.getByText("First event")).toBeInTheDocument();
    expect(screen.getByText("1h ago")).toBeInTheDocument();
    expect(screen.getByText("Second event")).toBeInTheDocument();
    expect(screen.getByText("2h ago")).toBeInTheDocument();
  });
});
