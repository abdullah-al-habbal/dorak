import { describe, expect, it } from "vitest";

import { Locale } from "@/enums/access/locale.enum";
import { resolveLocale } from "@/locales/resolve-locale.util";

describe("resolveLocale", () => {
  it("prefers the cookie", () => {
    expect(resolveLocale("ar", "en-US,en;q=0.9")).toBe(Locale.Ar);
  });
  it("falls back to the best Accept-Language match", () => {
    expect(resolveLocale(undefined, "fr;q=0.9, ar-EG;q=0.8, en;q=0.4")).toBe(Locale.Ar);
  });
  it("defaults to English", () => {
    expect(resolveLocale("zz", "fr")).toBe(Locale.En);
    expect(resolveLocale(undefined, null)).toBe(Locale.En);
  });
});
