import type { Locale } from "@/i18n/locales.types";
import type { ILocalizedName } from "@/services/api/dashboard/shared/types/ilocalized-name.types";

const FALLBACK_LOCALE: Record<Locale, Locale> = { en: "ar", ar: "en" };

/** Name in the viewer's locale, falling back to the other language when empty. */
export function localizedName(
  name: Partial<ILocalizedName> | null | undefined,
  locale: Locale,
): string {
  return name?.[locale] || name?.[FALLBACK_LOCALE[locale]] || "";
}
