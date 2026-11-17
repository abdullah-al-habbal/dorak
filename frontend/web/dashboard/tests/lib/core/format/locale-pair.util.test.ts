import { describe, expect, it } from "vitest";

import { toLocalePair } from "@/lib/core/format/locale-pair.util";

const EMPTY = { en: "", ar: "" };

describe("toLocalePair", () => {
  it("reads both locales", () => {
    expect(toLocalePair({ en: "Haircut", ar: "قص الشعر" })).toEqual({ en: "Haircut", ar: "قص الشعر" });
  });

  it("fills a missing locale with an empty string", () => {
    expect(toLocalePair({ en: "Haircut" })).toEqual({ en: "Haircut", ar: "" });
    expect(toLocalePair({ ar: "قص" })).toEqual({ en: "", ar: "قص" });
  });

  it("treats unset values, including the API's empty array, as empty", () => {
    expect(toLocalePair(undefined)).toEqual(EMPTY);
    expect(toLocalePair(null)).toEqual(EMPTY);
    expect(toLocalePair([])).toEqual(EMPTY);
    expect(toLocalePair("text")).toEqual(EMPTY);
  });

  it("ignores values that are not strings and extra keys", () => {
    expect(toLocalePair({ en: 5, ar: null, fr: "Coupe" })).toEqual(EMPTY);
  });
});
