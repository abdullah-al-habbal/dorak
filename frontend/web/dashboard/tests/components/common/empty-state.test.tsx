// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EmptyState } from "@/components/common/empty-state";

describe("EmptyState", () => {
  it("shows the title and body without a clear button by default", () => {
    render(<EmptyState title="No bookings" body="Nothing today." />);
    expect(screen.getByText("No bookings")).toBeInTheDocument();
    expect(screen.getByText("Nothing today.")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("offers a way out of a filtered list and calls it on click", async () => {
    const onClear = vi.fn();
    render(<EmptyState variant="filtered" title="No match" body="Try again." onClear={onClear} clearLabel="Clear filters" />);
    await userEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("hides the clear button when no label is given", () => {
    render(<EmptyState title="No match" body="Try again." onClear={() => undefined} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders a custom action", () => {
    render(<EmptyState title="Locked" body="No access." variant="forbidden" action={<a href="/home">Go home</a>} />);
    expect(screen.getByRole("link", { name: "Go home" })).toHaveAttribute("href", "/home");
  });
});
