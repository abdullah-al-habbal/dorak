import { describe, expect, it } from "vitest";

import { branchInputToUtcIso, branchWallClock, isoToBranchInput } from "@/lib/bookings/branch-clock.util";
import { layoutDay } from "@/lib/bookings/slot-layout.util";
import { BookingStatus } from "@/enums/booking/booking-status.enum";
import { formatTime } from "@/lib/core/format/booking-format.util";
import { createWalkInSchema } from "@/schemas/bookings/walk-in-form.zod";
import { enDictionary } from "@/locales/en/index.constant";

describe("branch clock (BG-55)", () => {
  it("reads an instant on the branch clock, whatever the browser zone", () => {
    expect(isoToBranchInput("2026-12-02T22:30:00Z", "Asia/Damascus")).toBe("2026-12-03T01:30");
    expect(branchWallClock("2026-12-02T03:30:00Z", "Asia/Kolkata").getHours()).toBe(9);
  });

  it("turns a time typed on the branch clock into the UTC instant", () => {
    expect(branchInputToUtcIso("2026-12-02T09:00", "Asia/Damascus")).toBe("2026-12-02T06:00:00.000Z");
    expect(branchInputToUtcIso("2026-12-02T09:00", "Asia/Kolkata")).toBe("2026-12-02T03:30:00.000Z");
  });

  it("uses the offset of the typed day around a clock change", () => {
    // London moves forward on 2027-03-28.
    expect(branchInputToUtcIso("2027-03-27T09:00", "Europe/London")).toBe("2027-03-27T09:00:00.000Z");
    expect(branchInputToUtcIso("2027-03-28T09:00", "Europe/London")).toBe("2027-03-28T08:00:00.000Z");
  });

  it("falls back to the browser zone without a branch zone", () => {
    const iso = "2026-12-02T06:00:00.000Z";
    expect(branchWallClock(iso, undefined).toISOString()).toBe(iso);
    expect(branchInputToUtcIso(isoToBranchInput(iso, undefined), undefined)).toBe(iso);
  });

  it("formats and places a booking at the branch time", () => {
    const booking = { id: "b1", starts_at: "2026-12-02T06:00:00Z", ends_at: "2026-12-02T06:30:00Z", timezone: "Asia/Kolkata", booking_status: BookingStatus.Confirmed, services: [] };

    expect(formatTime(booking.starts_at, "en-GB", booking.timezone)).toBe("11:30");
    expect(layoutDay([booking], new Date(2026, 11, 2))[0]).toMatchObject({ startMinute: 11 * 60 + 30, endMinute: 12 * 60 });
  });

  it("checks that a walk-in start is in the future on the branch clock", () => {
    const now = () => Date.parse("2026-12-02T07:00:00Z");
    const schema = createWalkInSchema(enDictionary.bookings.walkIn.validation, now, "Asia/Damascus");
    const startIssue = (starts_at: string): boolean =>
      schema.safeParse({ customer_name: "A", customer_email: "a@b.co", customer_phone: "", chair_id: "c", service_ids: ["s"], starts_at }).error?.issues.some((issue) => issue.path[0] === "starts_at") ?? false;

    // 07:00 UTC is 10:00 at the branch.
    expect(startIssue("2026-12-02T09:59")).toBe(true);
    expect(startIssue("2026-12-02T10:01")).toBe(false);
  });
});
