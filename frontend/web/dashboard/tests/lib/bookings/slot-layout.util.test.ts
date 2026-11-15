import { describe, expect, it } from "vitest";

import { BookingStatus } from "@/enums/booking/booking-status.enum";
import { layoutDay } from "@/lib/bookings/slot-layout.util";
import type { Booking } from "@/types/bookings/booking.type";

function booking(id: string, start: string, end: string | null): Booking {
  return { id, starts_at: start, ends_at: end, booking_status: BookingStatus.Confirmed, services: [] };
}
const DAY = new Date(2026, 10, 4);
const at = (hour: number, minute = 0, day = 4) => new Date(2026, 10, day, hour, minute).toISOString();

describe("layoutDay", () => {
  it("places a booking by minutes from local midnight", () => {
    const [event] = layoutDay([booking("a", at(9, 30), at(10, 15))], DAY);
    expect(event).toMatchObject({ startMinute: 570, endMinute: 615, column: 0, columns: 1 });
  });

  it("puts overlapping bookings side by side and keeps a later one alone", () => {
    const events = layoutDay([booking("a", at(9), at(10)), booking("b", at(9, 30), at(10, 30)), booking("c", at(11), at(12))], DAY);
    const byId = Object.fromEntries(events.map((event) => [event.booking.id, event]));
    expect([byId.a.column, byId.b.column]).toEqual([0, 1]);
    expect([byId.a.columns, byId.b.columns, byId.c.columns]).toEqual([2, 2, 1]);
  });

  it("clips a booking that crosses midnight and flags the continuation", () => {
    const events = layoutDay([booking("a", at(23), at(1, 0, 5))], DAY);
    expect(events[0]).toMatchObject({ startMinute: 1380, endMinute: 1440, continuesAfter: true, continuesBefore: false });
    const next = layoutDay([booking("a", at(23), at(1, 0, 5))], new Date(2026, 10, 5));
    expect(next[0]).toMatchObject({ startMinute: 0, endMinute: 60, continuesBefore: true });
  });

  it("ignores bookings on other days and gives short ones a minimum height", () => {
    expect(layoutDay([booking("a", at(9, 0, 6), at(10, 0, 6))], DAY)).toHaveLength(0);
    expect(layoutDay([booking("a", at(9), at(9, 5))], DAY)[0].endMinute).toBe(555);
  });

  it("falls back to service durations, then 30 minutes, when ends_at is missing", () => {
    const withService: Booking = { ...booking("a", at(9), null), services: [{ id: "s", duration_minutes: 45 }] };
    expect(layoutDay([withService], DAY)[0].endMinute).toBe(585);
    expect(layoutDay([booking("b", at(9), null)], DAY)[0].endMinute).toBe(570);
  });
});
