import type { Locale } from "@/enums/locale.enum";
import type { TextDirection } from "@/enums/text-direction.enum";
import type { Dictionary } from "@/types/dictionary.type";

export interface I18nContextValue {
  locale: Locale;
  direction: TextDirection;
  dictionary: Dictionary;
}
