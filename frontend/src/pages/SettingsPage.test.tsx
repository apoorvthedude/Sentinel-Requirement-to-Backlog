import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import SettingsPage from "./SettingsPage";

describe("SettingsPage", () => {
  it("renders connection status and read-only fields", () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );
    expect(screen.getByText("Connected")).toBeInTheDocument();
    expect(screen.getByDisplayValue("https://acme.atlassian.net")).toBeInTheDocument();
    expect(screen.getByDisplayValue("PROJ")).toBeInTheDocument();
  });

  it("changing default issue type updates the select value", async () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );
    const select = screen.getByRole("combobox");
    await userEvent.selectOptions(select, "Epic");
    expect(select).toHaveValue("Epic");
  });
});
