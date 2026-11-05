import { describe, expect, it } from "vitest";

import { parseDuration, splitDuration } from "@/lib/duration.util";

describe("duration util", () => {
  it("treats empty as no fixed duration and enforces 1-1440", () => {
    expect(parseDuration("")).toBeNull();
    expect(parseDuration("30")).toBe(30);
    expect(parseDuration("1440")).toBe(1440);
    expect(parseDuration("0")).toBeUndefined();
    expect(parseDuration("1441")).toBeUndefined();
    expect(parseDuration("1.5")).toBeUndefined();
    expect(parseDuration("-5")).toBeUndefined();
  });

  it("splits minutes for display", () => {
    expect(splitDuration(90)).toEqual({ hours: 1, minutes: 30 });
    expect(splitDuration(45)).toEqual({ hours: 0, minutes: 45 });
  });
});
