import { BOOKING_APP_URL_ENV } from "@/config/public-profile.constant";
import type { Locale } from "@/enums/access/locale.enum";
import { DICTIONARIES } from "@/locales/dictionaries.constant";
import { getServerLocale } from "@/locales/get-server-locale";
import type { Dictionary } from "@/types/core/shared/dictionary.type";

export interface PublicProfileContext {
  locale: Locale;
  dictionary: Dictionary;
  bookingUrl: string | null;
}

/** The language, texts and booking link every public profile screen needs; read once per request. */
export async function readPublicProfileContext(): Promise<PublicProfileContext> {
  const locale = await getServerLocale();
  return { locale, dictionary: DICTIONARIES[locale], bookingUrl: process.env[BOOKING_APP_URL_ENV]?.trim() || null };
}
