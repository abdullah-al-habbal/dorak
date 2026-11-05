import { describe, expect, it } from "vitest";
import { hasFieldTypes, isOneOf, isRecord } from "@/utils/guards.util";

describe("isRecord", () => {
  it("accepts plain objects only", () => {
    expect(isRecord({ a: 1 })).toBe(true);
    expect(isRecord(null)).toBe(false);
    expect(isRecord([])).toBe(false);
    expect(isRecord("x")).toBe(false);
  });
});

describe("isOneOf", () => {
  it("narrows to members of an as-const list", () => {
    const values = ["a", "b"] as const;
    expect(isOneOf(values, "a")).toBe(true);
    expect(isOneOf(values, "c")).toBe(false);
    expect(isOneOf(values, 1)).toBe(false);
  });
});

describe("hasFieldTypes", () => {
  it("checks every configured field by typeof", () => {
    const fields = { success: "boolean", message: "string" } as const;
    expect(
      hasFieldTypes({ success: true, message: "", extra: 1 }, fields),
    ).toBe(true);
    expect(hasFieldTypes({ success: "true", message: "" }, fields)).toBe(false);
    expect(hasFieldTypes({ success: true }, fields)).toBe(false);
    expect(hasFieldTypes(null, fields)).toBe(false);
  });
});
