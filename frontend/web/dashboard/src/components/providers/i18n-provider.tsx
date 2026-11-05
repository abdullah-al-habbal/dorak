"use client";

import { useLayoutEffect } from "react";
import type { ReactNode } from "react";

import { I18nContext } from "@/components/providers/i18n-context";
import type { I18nContextValue } from "@/interfaces/i18n-context-value.interface";

interface I18nProviderProps {
  value: I18nContextValue;
  children: ReactNode;
}

export function I18nProvider({ value, children }: I18nProviderProps) {
  useLayoutEffect(() => {
    document.documentElement.lang = value.locale;
    document.documentElement.dir = value.direction;
  }, [value.locale, value.direction]);

  return <I18nContext value={value}>{children}</I18nContext>;
}
