import { describe, expect, it } from "vitest";

import { BookingStatus } from "@/enums/booking/booking-status.enum";
import { BookingView } from "@/enums/booking/booking-view.enum";
import { isEnumValue, parseEnumValue } from "@/lib/core/parse/enum-value.util";

describe("parseEnumValue", () => {
  it("returns the member for every value of the enum", () => {
    for (const status of Object.values(BookingStatus)) expect(parseEnumValue(BookingStatus, status)).toBe(status);
  });

  it("returns undefined for unknown, empty and missing values", () => {
    expect(parseEnumValue(BookingStatus, "martian")).toBeUndefined();
    expect(parseEnumValue(BookingStatus, "")).toBeUndefined();
    expect(parseEnumValue(BookingStatus, null)).toBeUndefined();
    expect(parseEnumValue(BookingStatus, undefined)).toBeUndefined();
  });

  it("does not match an enum key, an inherited property or another enum's value", () => {
    expect(parseEnumValue(BookingStatus, "Completed")).toBeUndefined();
    expect(parseEnumValue(BookingStatus, "toString")).toBeUndefined();
    expect(parseEnumValue(BookingStatus, BookingView.Week)).toBeUndefined();
  });

  it("supports a fallback with ??", () => {
    expect(parseEnumValue(BookingView, "nope") ?? BookingView.Week).toBe(BookingView.Week);
  });
});

describe("isEnumValue", () => {
  it("accepts members and rejects everything else, including non-strings", () => {
    expect(isEnumValue(BookingView, BookingView.Day)).toBe(true);
    expect(isEnumValue(BookingView, "month")).toBe(false);
    expect(isEnumValue(BookingView, 3)).toBe(false);
    expect(isEnumValue(BookingView, null)).toBe(false);
  });
});
