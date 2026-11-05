"use client";

import { useI18n } from "@/hooks/use-i18n";
import type { Dictionary } from "@/types/dictionary.type";

export function useDictionary(): Dictionary {
  return useI18n().dictionary;
}
