import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import TopNav from "./TopNav";

function renderTopNav(active: "dashboard" | "wizard" | "history" | "settings") {
  return render(
    <MemoryRouter>
      <TopNav active={active} />
    </MemoryRouter>
  );
}

describe("TopNav", () => {
  it("renders all 4 nav links with correct hrefs", () => {
    renderTopNav("wizard");
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "href",
      "/dashboard"
    );
    expect(screen.getByRole("link", { name: "New Requirement" })).toHaveAttribute(
      "href",
      "/"
    );
    expect(screen.getByRole("link", { name: "History" })).toHaveAttribute(
      "href",
      "/history"
    );
    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute(
      "href",
      "/settings"
    );
  });

  it("marks the active tab distinctly for each active value", () => {
    renderTopNav("history");
    expect(screen.getByRole("link", { name: "History" })).toHaveClass(
      "top-nav__pill--active"
    );
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveClass(
      "top-nav__pill--active"
    );
  });

  it("brand link points to /", () => {
    renderTopNav("dashboard");
    expect(screen.getByRole("link", { name: "Sentinel" })).toHaveAttribute("href", "/");
  });
});
