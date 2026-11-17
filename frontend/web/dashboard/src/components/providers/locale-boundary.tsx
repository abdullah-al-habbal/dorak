import type { JSX, ReactNode } from "react";

import { I18nProvider } from "@/components/providers/i18n-provider";
import { LOCALE_DIRECTION } from "@/config/locales.constant";
import { DICTIONARIES } from "@/locales/dictionaries.constant";
import { getServerLocale } from "@/locales/get-server-locale";

export async function LocaleBoundary({ children }: { children: ReactNode }): Promise<JSX.Element> {
  const locale = await getServerLocale();
  const value = { locale, direction: LOCALE_DIRECTION[locale], dictionary: DICTIONARIES[locale] };
  return <I18nProvider value={value}>{children}</I18nProvider>;
}
