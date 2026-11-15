import { describe, expect, it } from "vitest";

import { defaultWalkInStart, isoToLocalInput, localInputToUtcIso, parseLocalInput, toLocalInput } from "@/lib/bookings/booking-datetime.util";

describe("booking datetime util", () => {
  it("round-trips local input through UTC ISO", () => {
    const iso = localInputToUtcIso("2026-11-10T14:30");
    expect(iso).toMatch(/Z$/);
    expect(isoToLocalInput(iso)).toBe("2026-11-10T14:30");
  });

  it("rejects empty and invalid input", () => {
    expect(parseLocalInput("")).toBeNull();
    expect(parseLocalInput("nope")).toBeNull();
    expect(() => localInputToUtcIso("")).toThrow(RangeError);
  });

  it("defaults a walk-in to a future start", () => {
    const now = new Date(2026, 10, 4, 9, 50);
    expect(defaultWalkInStart(now)).toBe(toLocalInput(new Date(2026, 10, 4, 10, 5)));
  });
});
