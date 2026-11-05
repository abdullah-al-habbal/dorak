import { getDictionary } from "@/i18n/dictionary.util";
import { DEFAULT_LOCALE, LOCALE_COOKIE } from "@/i18n/locales.constant";
import { detectLocaleFromHeader, isLocale } from "@/i18n/locales.util";

/** Resolve the same locale policy for route handlers without relying on React request context. */
export function getRequestDictionary(request: Request) {
  const cookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${LOCALE_COOKIE}=`))
    ?.slice(LOCALE_COOKIE.length + 1);
  const locale = isLocale(cookie)
    ? cookie
    : (detectLocaleFromHeader(request.headers.get("accept-language")) ??
      DEFAULT_LOCALE);
  return getDictionary(locale);
}
