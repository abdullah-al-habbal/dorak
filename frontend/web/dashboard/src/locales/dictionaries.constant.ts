import { Locale } from "@/enums/locale.enum";
import { arDictionary } from "@/locales/ar/index.constant";
import { enDictionary } from "@/locales/en/index.constant";
import type { Dictionary } from "@/types/dictionary.type";

export const DICTIONARIES: Record<Locale, Dictionary> = {
  [Locale.En]: enDictionary,
  [Locale.Ar]: arDictionary,
};
