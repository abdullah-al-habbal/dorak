import type { Dictionary } from "@/i18n/dictionary.types";
import type { Direction, Locale } from "@/i18n/locales.types";

/** Resolved locale state shared by the server resolver and the client context. */
export interface I18nState {
  locale: Locale;
  dir: Direction;
  dictionary: Dictionary;
}
