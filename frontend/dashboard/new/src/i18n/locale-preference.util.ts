import { LOCALE_COOKIE, LOCALE_PREFERENCE_MAX_AGE_SECONDS } from "@/i18n/locales.constant";
import type { Locale } from "@/i18n/locales.types";

/** Cookie string the server reads in `getServerI18n`; direction always derives from the locale. */
export function localePreferenceCookie(locale: Locale): string {
  return `${LOCALE_COOKIE}=${locale};path=/;max-age=${LOCALE_PREFERENCE_MAX_AGE_SECONDS};samesite=lax`;
}

export function persistLocalePreference(locale: Locale): void {
  document.cookie = localePreferenceCookie(locale);
}
