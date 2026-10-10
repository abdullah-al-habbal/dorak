import { describe, expect, it } from "vitest";
import { LOCALES } from "@/i18n/locales.constant";
import { detectLocaleFromHeader, directionForLocale, isLocale } from "@/i18n/locales.util";

describe("locale and RTL contract", () => {
  it("supports only English LTR and Arabic RTL", () => {
    expect(LOCALES).toEqual(["en", "ar"]);
    expect(directionForLocale("en")).toBe("ltr");
    expect(directionForLocale("ar")).toBe("rtl");
    expect(isLocale("ar")).toBe(true);
    expect(isLocale("fr")).toBe(false);
  });

  it("picks the highest-weighted supported Accept-Language tag", () => {
    expect(detectLocaleFromHeader("fr-FR, ar-EG;q=0.9, en;q=0.8")).toBe("ar");
    expect(detectLocaleFromHeader("en-US;q=0.4, ar;q=0.6")).toBe("ar");
    expect(detectLocaleFromHeader("fr, de")).toBeNull();
    expect(detectLocaleFromHeader(null)).toBeNull();
  });
});
