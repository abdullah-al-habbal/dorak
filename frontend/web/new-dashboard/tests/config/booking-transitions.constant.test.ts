import { describe, expect, it } from "vitest";

import { BOOKING_STATUS_STYLE } from "@/config/booking-status-badge.constant";
import { BOOKING_TRANSITIONS } from "@/config/booking-transitions.constant";
import { BookingStatus } from "@/enums/booking-status.enum";

const ALL = Object.values(BookingStatus);

describe("booking status config", () => {
  it("covers all six statuses in the transition map and badge styles", () => {
    expect(ALL).toHaveLength(6);
    expect(Object.keys(BOOKING_TRANSITIONS).sort()).toEqual([...ALL].sort());
    expect(Object.keys(BOOKING_STATUS_STYLE).sort()).toEqual([...ALL].sort());
  });

  it("matches the backend graph and never targets pending", () => {
    expect(BOOKING_TRANSITIONS[BookingStatus.Pending]).toEqual([BookingStatus.Confirmed, BookingStatus.Cancelled]);
    expect(BOOKING_TRANSITIONS[BookingStatus.InProgress]).toContain(BookingStatus.Completed);
    for (const terminal of [BookingStatus.Completed, BookingStatus.Cancelled, BookingStatus.NoShow]) {
      expect(BOOKING_TRANSITIONS[terminal]).toEqual([]);
    }
    expect(Object.values(BOOKING_TRANSITIONS).flat()).not.toContain(BookingStatus.Pending);
  });
});
