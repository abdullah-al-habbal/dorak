import { afterEach, describe, expect, it, vi } from "vitest";

import { BookingView } from "@/enums/booking-view.enum";
import { apiRequestWithMeta } from "@/services/api/core/client";
import { fetchBookingsForView } from "@/services/api/query/bookings.query";
import type { Booking } from "@/types/booking.type";
import type { BookingFilters } from "@/types/booking-filters.type";

vi.mock("@/services/api/core/client", () => ({ apiRequestWithMeta: vi.fn() }));

const request = vi.mocked(apiRequestWithMeta);
const WEEK_START = 1;
const PER_PAGE = 100;

function booking(id: string): Booking {
  return { id } as Booking;
}

function pageMeta(currentPage: number, totalPages: number, total: number): { pagination: Record<string, number> } {
  return { pagination: { total, per_page: PER_PAGE, current_page: currentPage, total_pages: totalPages } };
}

function filters(view: BookingView, page = 1): BookingFilters {
  return { view, date: "2026-11-08", page };
}

function requestedPage(call: number): string | null {
  const path = String(request.mock.calls[call][0]);
  return new URLSearchParams(path.slice(path.indexOf("?") + 1)).get("page");
}

describe("fetchBookingsForView", () => {
  afterEach(() => {
    request.mockReset();
  });

  it("reads only the requested page in the list view and keeps the server pagination", async () => {
    request.mockResolvedValueOnce({ data: [booking("a")], meta: pageMeta(3, 5, 401) });

    const result = await fetchBookingsForView(filters(BookingView.List, 3), WEEK_START);

    expect(request).toHaveBeenCalledTimes(1);
    expect(requestedPage(0)).toBe("3");
    expect(result).toEqual({ items: [booking("a")], page: { total: 401, per_page: PER_PAGE, current_page: 3, total_pages: 5 } });
  });

  it.each([BookingView.Day, BookingView.Week])("reads every page of the %s window and returns it as one page", async (view) => {
    request
      .mockResolvedValueOnce({ data: [booking("a"), booking("b")], meta: pageMeta(1, 2, 3) })
      .mockResolvedValueOnce({ data: [booking("c")], meta: pageMeta(2, 2, 3) });

    const result = await fetchBookingsForView(filters(view, 4), WEEK_START);

    expect(request).toHaveBeenCalledTimes(2);
    expect([requestedPage(0), requestedPage(1)]).toEqual(["1", "2"]);
    // The same single-page block the screen used to build inline.
    expect(result).toEqual({
      items: [booking("a"), booking("b"), booking("c")],
      page: { total: 3, per_page: 3, current_page: 1, total_pages: 1 },
    });
  });

  it("returns an empty single page when the window has no bookings", async () => {
    request.mockResolvedValueOnce({ data: [], meta: pageMeta(1, 1, 0) });

    const result = await fetchBookingsForView(filters(BookingView.Week), WEEK_START);

    expect(result).toEqual({ items: [], page: { total: 0, per_page: 0, current_page: 1, total_pages: 1 } });
  });
});
