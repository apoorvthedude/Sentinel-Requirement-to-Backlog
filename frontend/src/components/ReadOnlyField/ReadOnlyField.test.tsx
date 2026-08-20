import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ReadOnlyField from "./ReadOnlyField";

describe("ReadOnlyField", () => {
  it("renders label and value, and is read-only", () => {
    render(<ReadOnlyField label="Jira site URL" value="https://acme.atlassian.net" />);
    expect(screen.getByText("Jira site URL")).toBeInTheDocument();
    const input = screen.getByDisplayValue("https://acme.atlassian.net");
    expect(input).toHaveAttribute("readonly");
  });
});
