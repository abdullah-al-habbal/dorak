// @vitest-environment jsdom
import { BarberAppointmentsSection } from "@/components/barber-workspace/barber-appointments-section";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

function renderSection(
  status: string,
  overrides: { onTransition?: ReturnType<typeof vi.fn> } = {},
) {
  const onTransition = overrides.onTransition ?? vi.fn();
  const onCancelRequest = vi.fn();
  render(
    <BarberAppointmentsSection
      title="Today"
      isPending={false}
      loadingLabel="Loading"
      appointmentLabel="Appointment"
      acceptLabel="Accept"
      startLabel="Start"
      completeLabel="Complete"
      noShowLabel="No-show"
      cancelLabel="Cancel"
      appointments={[{ id: "b-1", status, startsAt: "2026-10-26T09:00:00Z" }]}
      onTransition={onTransition}
      onCancelRequest={onCancelRequest}
    />,
  );
  return { onTransition, onCancelRequest };
}

afterEach(cleanup);

describe("BarberAppointmentsSection", () => {
  it("shows only Accept and Cancel for a pending appointment", () => {
    renderSection("pending");

    expect(screen.getByRole("button", { name: "Accept" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Start" })).toBeNull();
  });

  it("shows only Start and Cancel for a confirmed appointment", () => {
    renderSection("confirmed");

    expect(screen.getByRole("button", { name: "Start" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Accept" })).toBeNull();
  });

  it("shows Complete and No-show without Cancel for an in-progress appointment", () => {
    renderSection("in_progress");

    expect(screen.getByRole("button", { name: "Complete" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "No-show" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Cancel" })).toBeNull();
  });

  it("calls onTransition with the start action", async () => {
    const user = userEvent.setup();
    const { onTransition } = renderSection("confirmed");

    await user.click(screen.getByRole("button", { name: "Start" }));

    expect(onTransition).toHaveBeenCalledWith("b-1", "start");
  });

  it("calls onTransition with the complete action", async () => {
    const user = userEvent.setup();
    const { onTransition } = renderSection("in_progress");

    await user.click(screen.getByRole("button", { name: "Complete" }));

    expect(onTransition).toHaveBeenCalledWith("b-1", "complete");
  });

  it("calls onTransition with the no-show action", async () => {
    const user = userEvent.setup();
    const { onTransition } = renderSection("in_progress");

    await user.click(screen.getByRole("button", { name: "No-show" }));

    expect(onTransition).toHaveBeenCalledWith("b-1", "no-show");
  });
});
