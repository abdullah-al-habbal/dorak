// @vitest-environment jsdom
import "@tests/helpers/dom.helper";

import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RescheduleDialog } from "@/components/bookings/dialogs/reschedule-dialog";
import { ApiErrorCode } from "@/enums/access/api-error-code.enum";
import { enDictionary } from "@/locales/en/index.constant";
import { ApiClientError } from "@/services/api/core/api-client-error";
import { labelStart } from "@tests/helpers/label.helper";
import { renderInApp } from "@tests/helpers/list-screen.helper";
import type { Booking } from "@/types/bookings/booking.type";

const mutateAsync = vi.hoisted(() => vi.fn());
vi.mock("@/hooks/bookings/use-reschedule-booking", () => ({ useRescheduleBooking: () => ({ mutateAsync, isPending: false }) }));

const r = enDictionary.bookings.reschedule;
const booking = { id: "bk1", starts_at: "2999-01-10T10:00:00.000Z", ends_at: "2999-01-10T10:30:00.000Z" } as unknown as Booking;

function setTimes(start: string, end: string): void {
  fireEvent.change(screen.getByLabelText(labelStart(r.start)), { target: { value: start } });
  fireEvent.change(screen.getByLabelText(labelStart(r.end)), { target: { value: end } });
}

describe("RescheduleDialog", () => {
  beforeEach(() => {
    mutateAsync.mockReset();
    mutateAsync.mockResolvedValue(undefined);
  });

  it("starts from the booking's current time", () => {
    renderInApp(<RescheduleDialog booking={booking} onClose={vi.fn()} />);
    expect(screen.getByLabelText(labelStart(r.start))).not.toHaveValue("");
    expect(screen.getByLabelText(labelStart(r.end))).not.toHaveValue("");
  });

  it("refuses an end that is not after the start", async () => {
    renderInApp(<RescheduleDialog booking={booking} onClose={vi.fn()} />);
    setTimes("2999-01-11T12:00", "2999-01-11T11:00");
    await userEvent.click(screen.getByRole("button", { name: r.submit }));
    expect(await screen.findByText(r.validation.endAfterStart)).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("sends the new time as UTC and closes", async () => {
    const onClose = vi.fn();
    renderInApp(<RescheduleDialog booking={booking} onClose={onClose} />);
    setTimes("2999-01-11T09:00", "2999-01-11T09:45");
    await userEvent.click(screen.getByRole("button", { name: r.submit }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(mutateAsync).toHaveBeenCalledWith({
      id: "bk1",
      payload: { starts_at: new Date("2999-01-11T09:00").toISOString(), ends_at: new Date("2999-01-11T09:45").toISOString() },
    });
  });

  it("explains a taken slot under the start field and stays open", async () => {
    mutateAsync.mockImplementation(async () => {
      throw new ApiClientError({ status: 409, code: ApiErrorCode.Conflict, message: "" });
    });
    const onClose = vi.fn();
    renderInApp(<RescheduleDialog booking={booking} onClose={onClose} />);
    setTimes("2999-01-11T09:00", "2999-01-11T09:45");
    await userEvent.click(screen.getByRole("button", { name: r.submit }));
    expect(await screen.findByText(r.errors.conflict)).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("explains a time outside the barber's schedule", async () => {
    mutateAsync.mockImplementation(async () => {
      throw new ApiClientError({ status: 422, code: "booking_outside_schedule" as ApiErrorCode, message: "" });
    });
    renderInApp(<RescheduleDialog booking={booking} onClose={vi.fn()} />);
    setTimes("2999-01-11T03:00", "2999-01-11T03:45");
    await userEvent.click(screen.getByRole("button", { name: r.submit }));
    expect(await screen.findByText(r.errors.outsideSchedule)).toBeInTheDocument();
  });
});
