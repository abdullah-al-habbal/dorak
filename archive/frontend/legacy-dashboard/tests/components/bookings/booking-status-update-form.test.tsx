// @vitest-environment jsdom
import { BookingStatusUpdateForm } from "@/components/bookings/booking-status-update-form";
import { updateBookingStatus } from "@/services/api/dashboard/booking/booking.mutation";
import type { BookingStatus } from "@/services/api/dashboard/booking/types/booking-status.types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/api/dashboard/booking/booking.mutation", () => ({
  updateBookingStatus: vi.fn(),
}));

const LABELS = {
  nextStatusLabel: "Next status",
  confirmedLabel: "Confirmed",
  inProgressLabel: "In progress",
  completedLabel: "Completed",
  noShowLabel: "No-show",
  cancelledLabel: "Cancelled",
  updateStatusLabel: "Update status",
};

function renderedOptionValues(currentStatus: BookingStatus): string[] {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const { container } = render(
    <QueryClientProvider client={client}>
      <BookingStatusUpdateForm
        bookingId="b-1"
        currentStatus={currentStatus}
        {...LABELS}
        onSuccess={vi.fn()}
        onError={vi.fn()}
      />
    </QueryClientProvider>,
  );
  return Array.from(container.querySelectorAll("option"))
    .map((option) => option.value)
    .filter((value) => value !== "");
}

beforeEach(() => {
  vi.mocked(updateBookingStatus).mockReset();
});

afterEach(cleanup);

describe("BookingStatusUpdateForm", () => {
  it("offers exactly confirmed and cancelled for a pending booking", () => {
    expect(renderedOptionValues("pending")).toEqual(["confirmed", "cancelled"]);
  });

  it("offers exactly in_progress, cancelled and no_show for a confirmed booking", () => {
    expect(renderedOptionValues("confirmed")).toEqual([
      "in_progress",
      "cancelled",
      "no_show",
    ]);
  });

  it("offers exactly completed, cancelled and no_show for an in-progress booking", () => {
    expect(renderedOptionValues("in_progress")).toEqual([
      "completed",
      "cancelled",
      "no_show",
    ]);
  });

  it.each(["completed", "cancelled", "no_show"] as const)(
    "renders no status form for the terminal status %s",
    (status) => {
      const client = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });
      const { container } = render(
        <QueryClientProvider client={client}>
          <BookingStatusUpdateForm
            bookingId="b-1"
            currentStatus={status}
            {...LABELS}
            onSuccess={vi.fn()}
            onError={vi.fn()}
          />
        </QueryClientProvider>,
      );

      expect(container.querySelector("form")).toBeNull();
    },
  );
});
