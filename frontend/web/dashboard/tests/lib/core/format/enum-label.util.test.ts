import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { enumLabel, resetEnumLabelWarnings } from "@/lib/core/format/enum-label.util";

const labels = { pending: "Pending", done: "Done" };

describe("enumLabel", () => {
  beforeEach(() => {
    resetEnumLabelWarnings();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("returns the label of a known key without warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    expect(enumLabel(labels, "pending", "Unknown", "booking")).toBe("Pending");
    expect(warn).not.toHaveBeenCalled();
  });

  it("returns the unknown label for an unmapped key, never the raw key", () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    expect(enumLabel(labels, "brand_new", "Unknown", "booking")).toBe("Unknown");
  });

  it("does not treat inherited object properties as keys", () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    expect(enumLabel(labels, "toString", "Unknown", "booking")).toBe("Unknown");
  });

  it("returns the unknown label for a missing key", () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    expect(enumLabel(labels, null, "Unknown", "booking")).toBe("Unknown");
    expect(enumLabel(labels, undefined, "Unknown", "booking")).toBe("Unknown");
  });

  it("warns once per scope and key outside production", () => {
    vi.stubEnv("NODE_ENV", "development");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    enumLabel(labels, "brand_new", "Unknown", "booking");
    enumLabel(labels, "brand_new", "Unknown", "booking");
    enumLabel(labels, "brand_new", "Unknown", "payout");
    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn.mock.calls[0]?.[0]).toContain("booking:brand_new");
  });

  it("does not warn in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    expect(enumLabel(labels, "brand_new", "Unknown", "booking")).toBe("Unknown");
    expect(warn).not.toHaveBeenCalled();
  });
});
