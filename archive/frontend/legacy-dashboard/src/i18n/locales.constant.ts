import type {
  Direction,
  Locale,
  LocaleSwitchCopyKey,
} from "@/i18n/locales.types";

export const LOCALES = ["en", "ar"] as const;

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_COOKIE = "NEXT_LOCALE";

export const LOCALE_PREFERENCE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export const LOCALE_DIRECTION: Record<Locale, Direction> = {
  en: "ltr",
  ar: "rtl",
};

/** Accessible label for the toggle, keyed by the locale it switches *to*. */
export const LOCALE_SWITCH_COPY: Record<Locale, LocaleSwitchCopyKey> = {
  en: "switchToEnglish",
  ar: "switchToArabic",
};
