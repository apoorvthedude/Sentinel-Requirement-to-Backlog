import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import SidebarField from "./SidebarField";

describe("SidebarField", () => {
  it("renders all options and the current value", () => {
    render(
      <SidebarField label="Priority" value="Medium" onChange={vi.fn()} options={["Low", "Medium", "High"]} />
    );
    expect(screen.getByText("Priority")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveValue("Medium");
  });

  it("calls onChange with the new value", async () => {
    const onChange = vi.fn();
    render(
      <SidebarField label="Priority" value="Medium" onChange={onChange} options={["Low", "Medium", "High"]} />
    );
    await userEvent.selectOptions(screen.getByRole("combobox"), "High");
    expect(onChange).toHaveBeenCalledWith("High");
  });
});
