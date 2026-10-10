"use client";

import { useRequiredContext } from "@/hooks/use-required-context";
import { I18nContext } from "@/i18n/i18n-context";
import type { I18nState } from "@/i18n/i18n.types";

export function useI18n(): I18nState {
  return useRequiredContext(I18nContext, "useI18n");
}
