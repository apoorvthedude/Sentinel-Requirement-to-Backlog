import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import DashboardPage from "./DashboardPage";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe("DashboardPage", () => {
  it("renders greeting, stat cards, and activity list", () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );
    expect(screen.getByText("Welcome back, Amit")).toBeInTheDocument();
    expect(screen.getByText("Requirements processed")).toBeInTheDocument();
    expect(screen.getByText("Recent activity")).toBeInTheDocument();
  });

  it("navigates to / when New Requirement is clicked", async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );
    await userEvent.click(screen.getByRole("button", { name: "New Requirement" }));
    expect(navigateMock).toHaveBeenCalledWith("/");
  });
});
