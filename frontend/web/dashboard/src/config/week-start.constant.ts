import { Locale } from "@/enums/access/locale.enum";

/** Day index the week starts on (0 = Sunday, 6 = Saturday). */
export const WEEK_START: Record<Locale, number> = {
  [Locale.En]: 0,
  [Locale.Ar]: 6,
};
