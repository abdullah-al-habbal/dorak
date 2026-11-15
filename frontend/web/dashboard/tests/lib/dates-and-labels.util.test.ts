import { describe, expect, it } from "vitest";

import { Locale } from "@/enums/locale.enum";
import { Weekday } from "@/enums/weekday.enum";
import { DICTIONARIES } from "@/locales/dictionaries.constant";
import { addDays, minutesBetween, parseDateKey, startOfWeek, toDateKey } from "@/lib/bookings/booking-date.util";
import { actorLabel, isBookingStatus, statusLabel } from "@/lib/bookings/booking-status-label.util";
import { formatCount, formatPercent, formatShortDate } from "@/lib/earnings/earnings-format.util";
import { registerErrorMessage } from "@/lib/account/register-error.util";
import { slugify } from "@/lib/core/slugify.util";
import { weekdayLabel } from "@/lib/hours/weekday-label.util";
import { ApiClientError } from "@/services/api/core/api-client-error";

describe("date keys", () => {
  it("formats and parses a local date key", () => {
    expect(toDateKey(new Date(2026, 2, 5))).toBe("2026-03-05");
    expect(parseDateKey("2026-03-05")).toEqual(new Date(2026, 2, 5));
  });

  it("rejects malformed and impossible dates", () => {
    for (const bad of ["2026-3-5", "2026-02-30", "2026-13-01", "abc", ""]) expect(parseDateKey(bad), bad).toBeNull();
    expect(parseDateKey("2024-02-29")).not.toBeNull();
  });

  it("adds days across month and year ends", () => {
    expect(toDateKey(addDays(new Date(2026, 11, 31), 1))).toBe("2027-01-01");
    expect(toDateKey(addDays(new Date(2026, 2, 1), -1))).toBe("2026-02-28");
  });

  it("finds the start of the week for each locale preference", () => {
    const wednesday = new Date(2026, 10, 11);
    expect(toDateKey(startOfWeek(wednesday, 0))).toBe("2026-11-08");
    expect(toDateKey(startOfWeek(wednesday, 1))).toBe("2026-11-09");
    expect(toDateKey(startOfWeek(wednesday, 6))).toBe("2026-11-07");
    expect(toDateKey(startOfWeek(new Date(2026, 10, 9), 1))).toBe("2026-11-09");
  });

  it("counts whole minutes between two instants", () => {
    expect(minutesBetween(new Date("2026-01-01T10:00:00Z"), new Date("2026-01-01T11:30:20Z"))).toBe(90);
    expect(minutesBetween(new Date("2026-01-01T10:00:00Z"), new Date("2026-01-01T09:00:00Z"))).toBe(-60);
  });
});

describe("labels", () => {
  const en = DICTIONARIES[Locale.En];

  it("localises a known booking status and passes an unknown one through", () => {
    expect(isBookingStatus("completed")).toBe(true);
    expect(isBookingStatus("martian")).toBe(false);
    expect(statusLabel("completed", en)).toBe(en.bookings.status.completed);
    expect(statusLabel("martian", en)).toBe("martian");
    expect(actorLabel("nobody", en)).toBe("nobody");
  });

  it("names weekdays in both locales", () => {
    expect(weekdayLabel(Weekday.Sunday, Locale.En)).toBe("Sunday");
    expect(weekdayLabel(Weekday.Saturday, Locale.En, "short")).toBe("Sat");
    expect(weekdayLabel(Weekday.Monday, Locale.Ar)).toBe("الاثنين");
  });

  it("slugifies to lowercase letters, digits and single dashes", () => {
    expect(slugify("Skin Fade 2")).toBe("skin-fade-2");
    expect(slugify("  --Hello,   World!!  ")).toBe("hello-world");
    expect(slugify("مرحبا")).toBe("");
  });

  it("formats percent, counts and short dates", () => {
    expect(formatPercent(12.5, "en")).toBe("12.5%");
    expect(formatPercent(10, "en")).toBe("10%");
    expect(formatCount(12345, "en")).toBe("12,345");
    expect(formatShortDate("2026-03-10", "en")).toBe("Mar 10");
    expect(formatShortDate("not-a-date", "en")).toBe("not-a-date");
  });
});

describe("registerErrorMessage", () => {
  const t = { tooMany: "slow down", banned: "banned" } as Parameters<typeof registerErrorMessage>[1];

  it("explains throttling and bans, and falls back for everything else", () => {
    expect(registerErrorMessage(new ApiClientError({ status: 429, code: "too_many_requests", message: "x" }), t, "generic")).toBe("slow down");
    expect(registerErrorMessage(new ApiClientError({ status: 403, code: "account_banned", message: "x" }), t, "generic")).toBe("banned");
    expect(registerErrorMessage(new ApiClientError({ status: 500, code: "server_error", message: "x" }), t, "generic")).toBe("generic");
    expect(registerErrorMessage(new Error("x"), t, "generic")).toBe("generic");
  });
});
