import { cookies, headers } from "next/headers";

import { LOCALE_COOKIE } from "@/config/cookies.constant";
import type { Locale } from "@/enums/locale.enum";
import { resolveLocale } from "@/locales/resolve-locale.util";

/** The locale of the current request: the saved cookie, else the browser's language, else the default. */
export async function getServerLocale(): Promise<Locale> {
  const [store, requestHeaders] = await Promise.all([cookies(), headers()]);
  return resolveLocale(store.get(LOCALE_COOKIE)?.value, requestHeaders.get("accept-language"));
}
