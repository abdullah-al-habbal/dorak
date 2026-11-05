"use client";

import { useI18n } from "@/hooks/use-i18n";
import type { Dictionary } from "@/i18n/dictionary.types";

export function useDictionary(): Dictionary {
  return useI18n().dictionary;
}
