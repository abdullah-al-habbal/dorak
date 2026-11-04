import { cookies, headers } from "next/headers";
import type { ReactNode } from "react";

import { I18nProvider } from "@/components/providers/i18n-provider";
import { LOCALE_DIRECTION } from "@/config/locales.constant";
import { LOCALE_COOKIE } from "@/config/cookies.constant";
import { DICTIONARIES } from "@/locales/dictionaries.constant";
import { resolveLocale } from "@/locales/resolve-locale.util";

export async function LocaleBoundary({ children }: { children: ReactNode }) {
  const [store, requestHeaders] = await Promise.all([cookies(), headers()]);
  const locale = resolveLocale(store.get(LOCALE_COOKIE)?.value, requestHeaders.get("accept-language"));
  const value = { locale, direction: LOCALE_DIRECTION[locale], dictionary: DICTIONARIES[locale] };
  return <I18nProvider value={value}>{children}</I18nProvider>;
}
