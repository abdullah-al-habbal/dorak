import { describe, expect, it } from "vitest";
import { localePreferenceCookie } from "@/i18n/locale-preference.util";
import { LOCALE_COOKIE } from "@/i18n/locales.constant";

describe("localePreferenceCookie", () => {
  it("persists only the locale; direction is derived server-side", () => {
    expect(localePreferenceCookie("ar")).toMatch(
      new RegExp(`^${LOCALE_COOKIE}=ar;path=/;max-age=\\d+;samesite=lax$`),
    );
  });
});
