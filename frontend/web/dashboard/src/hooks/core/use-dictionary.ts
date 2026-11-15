"use client";

import { useI18n } from "@/hooks/core/use-i18n";
import type { Dictionary } from "@/types/core/dictionary.type";

export function useDictionary(): Dictionary {
  return useI18n().dictionary;
}
