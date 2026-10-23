import { describe, expect, it } from "vitest";
import {
  emptyToNull,
  fieldLabelKey,
} from "@/components/entities/entity-form-field.util";

describe("fieldLabelKey", () => {
  it.each([
    ["name.en", "nameEn"],
    ["description.ar", "descriptionAr"],
    ["address.en", "addressEn"],
    ["email", "email"],
  ])("maps %s to %s", (field, key) => {
    expect(fieldLabelKey(field)).toBe(key);
  });
});

describe("emptyToNull", () => {
  it("turns empty or missing locales into null", () => {
    expect(emptyToNull({ en: "Main St", ar: "" })).toEqual({
      en: "Main St",
      ar: null,
    });
    expect(emptyToNull(undefined)).toEqual({ en: null, ar: null });
  });
});
