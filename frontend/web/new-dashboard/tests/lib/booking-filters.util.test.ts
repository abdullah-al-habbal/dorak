import { describe, expect, it } from "vitest";

import { BookingStatus } from "@/enums/booking-status.enum";
import { BookingView } from "@/enums/booking-view.enum";
import { filtersFromParams, filtersToParams, windowFor } from "@/lib/booking-filters.util";

const TODAY = new Date(2026, 10, 4);

describe("booking filters", () => {
  it("round-trips through the URL", () => {
    const filters = { view: BookingView.Day, date: "2026-11-10", status: BookingStatus.NoShow, chairId: "c1", search: "ali", page: 3 };
    expect(filtersFromParams(filtersToParams(filters, TODAY), TODAY)).toEqual(filters);
  });

  it("drops invalid values instead of trusting the URL", () => {
    const parsed = filtersFromParams(new URLSearchParams("view=month&date=2026-13-40&status=done&page=-2"), TODAY);
    expect(parsed).toEqual({ view: BookingView.Week, date: "2026-11-04", status: undefined, chairId: undefined, search: undefined, page: 1 });
  });

  it("keeps the URL empty for default filters", () => {
    expect(filtersToParams(filtersFromParams(new URLSearchParams(), TODAY), TODAY).toString()).toBe("");
  });

  it("computes the day and week windows for the locale's week start", () => {
    const base = { date: "2026-11-04", page: 1 };
    expect(windowFor({ ...base, view: BookingView.Day }, 0)).toEqual({ from: "2026-11-04", to: "2026-11-04" });
    expect(windowFor({ ...base, view: BookingView.Week }, 0)).toEqual({ from: "2026-11-01", to: "2026-11-07" });
    expect(windowFor({ ...base, view: BookingView.Week }, 6)).toEqual({ from: "2026-10-31", to: "2026-11-06" });
  });
});
