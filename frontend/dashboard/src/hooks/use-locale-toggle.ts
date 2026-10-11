"use client";

import { useDictionary } from "@/hooks/use-dictionary";
import { useI18n } from "@/hooks/use-i18n";
import { persistLocalePreference } from "@/i18n/locale-preference.util";
import { LOCALE_SWITCH_COPY, LOCALES } from "@/i18n/locales.constant";
import { useRouter } from "next/navigation";

export function useLocaleToggle() {
  const { locale } = useI18n();
  const dictionary = useDictionary();
  const router = useRouter();
  const nextLocale = LOCALES[(LOCALES.indexOf(locale) + 1) % LOCALES.length];

  function toggleLocale() {
    persistLocalePreference(nextLocale);
    router.refresh();
  }

  return {
    currentLocale: locale,
    ariaLabel: dictionary.common.locale[LOCALE_SWITCH_COPY[nextLocale]],
    toggleLocale,
  };
}
