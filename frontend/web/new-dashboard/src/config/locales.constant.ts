import { Locale } from "@/enums/locale.enum";
import { TextDirection } from "@/enums/text-direction.enum";

export const LOCALES: readonly Locale[] = [Locale.En, Locale.Ar];
export const DEFAULT_LOCALE = Locale.En;

export const LOCALE_DIRECTION: Record<Locale, TextDirection> = {
  [Locale.En]: TextDirection.Ltr,
  [Locale.Ar]: TextDirection.Rtl,
};

export const LOCALE_LABEL: Record<Locale, string> = {
  [Locale.En]: "English",
  [Locale.Ar]: "العربية",
};
