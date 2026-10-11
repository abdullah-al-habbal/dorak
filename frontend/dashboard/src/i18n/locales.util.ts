import { LOCALE_DIRECTION, LOCALES } from "@/i18n/locales.constant";
import type { Direction, Locale } from "@/i18n/locales.types";
import { isOneOf } from "@/utils/guards.util";

export function isLocale(value: unknown): value is Locale {
  return isOneOf(LOCALES, value);
}

export function directionForLocale(locale: Locale): Direction {
  return LOCALE_DIRECTION[locale];
}

/** Highest-weighted supported locale from an `Accept-Language` header, or null. */
export function detectLocaleFromHeader(
  acceptLanguage: string | null,
): Locale | null {
  if (!acceptLanguage) return null;

  const ordered = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const qParam = params.find((param) => param.trim().startsWith("q="));
      const q = qParam ? Number(qParam.trim().slice(2)) : 1;
      return { tag: tag.trim().toLowerCase(), q: Number.isFinite(q) ? q : 0 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ordered) {
    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
  }

  return null;
}
