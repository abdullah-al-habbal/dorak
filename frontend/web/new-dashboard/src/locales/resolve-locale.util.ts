import { DEFAULT_LOCALE, LOCALES } from "@/config/locales.constant";
import { Locale } from "@/enums/locale.enum";

function asLocale(value: string | undefined | null): Locale | null {
  const base = value?.trim().toLowerCase().split("-")[0];
  return LOCALES.find((locale) => locale === base) ?? null;
}

function fromAcceptLanguage(header: string | null | undefined): Locale | null {
  const ranked = (header ?? "")
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { locale: asLocale(tag), q: q ? Number(q) : 1 };
    })
    .filter((entry) => entry.locale !== null && !Number.isNaN(entry.q))
    .sort((a, b) => b.q - a.q);
  return ranked[0]?.locale ?? null;
}

export function resolveLocale(
  cookieValue: string | undefined | null,
  acceptLanguage: string | null | undefined,
): Locale {
  return asLocale(cookieValue) ?? fromAcceptLanguage(acceptLanguage) ?? DEFAULT_LOCALE;
}
