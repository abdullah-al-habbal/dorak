"use client";

import { useContext } from "react";

import { I18nContext } from "@/components/providers/i18n-context";
import type { I18nContextValue } from "@/interfaces/i18n-context-value.interface";

export function useI18n(): I18nContextValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside <I18nProvider>.");
  return value;
}
