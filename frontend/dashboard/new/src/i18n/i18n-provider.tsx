"use client";

import { useMemo } from "react";
import { I18nProvider } from "react-aria-components";
import { I18nContext } from "@/i18n/i18n-context";
import type { I18nState } from "@/i18n/i18n.types";

export function AppI18nProvider({
  locale,
  dir,
  dictionary,
  children,
}: I18nState & { children: React.ReactNode }) {
  const value = useMemo<I18nState>(
    () => ({ locale, dir, dictionary }),
    [locale, dir, dictionary],
  );

  return (
    <I18nContext.Provider value={value}>
      <I18nProvider locale={locale}>{children}</I18nProvider>
    </I18nContext.Provider>
  );
}
