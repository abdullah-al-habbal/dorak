"use client";

import { useI18n } from "@/hooks/core/state/use-i18n";
import type { Dictionary } from "@/types/core/shared/dictionary.type";

export function useDictionary(): Dictionary {
  return useI18n().dictionary;
}
