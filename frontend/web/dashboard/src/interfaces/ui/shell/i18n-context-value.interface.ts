import type { Locale } from "@/enums/access/locale.enum";
import type { TextDirection } from "@/enums/access/text-direction.enum";
import type { Dictionary } from "@/types/core/shared/dictionary.type";

export interface I18nContextValue {
  locale: Locale;
  direction: TextDirection;
  dictionary: Dictionary;
}
