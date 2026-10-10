import type { Dictionary } from "@/i18n/dictionary.types";
import { DEFAULT_LOCALE } from "@/i18n/locales.constant";
import type { Locale } from "@/i18n/locales.types";
import { ar } from "@/i18n/messages/ar.constant";
import { en } from "@/i18n/messages/en.constant";

const dictionaries: Record<Locale, Dictionary> = { en, ar };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}
