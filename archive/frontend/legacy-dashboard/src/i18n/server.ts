import { cookies, headers } from "next/headers";
import { cache } from "react";
import { getDictionary } from "@/i18n/dictionary.util";
import type { I18nState } from "@/i18n/i18n.types";
import { DEFAULT_LOCALE, LOCALE_COOKIE } from "@/i18n/locales.constant";
import type { Locale } from "@/i18n/locales.types";
import {
  detectLocaleFromHeader,
  directionForLocale,
  isLocale,
} from "@/i18n/locales.util";

async function resolveLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  if (isLocale(cookieLocale)) return cookieLocale;

  const headerStore = await headers();
  return (
    detectLocaleFromHeader(headerStore.get("accept-language")) ?? DEFAULT_LOCALE
  );
}

/** Request-scoped: layouts, metadata, loading and pages share one resolution per render. */
export const getServerI18n = cache(async (): Promise<I18nState> => {
  const locale = await resolveLocale();
  return {
    locale,
    dir: directionForLocale(locale),
    dictionary: getDictionary(locale),
  };
});
