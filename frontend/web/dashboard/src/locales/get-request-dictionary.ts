import { LOCALE_COOKIE } from "@/config/cookies.constant";
import { DICTIONARIES } from "@/locales/dictionaries.constant";
import { resolveLocale } from "@/locales/resolve-locale.util";
import type { Dictionary } from "@/types/core/shared/dictionary.type";

export function getRequestDictionary(request: Request): Dictionary {
  const cookie = request.headers
    .get("cookie")
    ?.split(/;\s*/)
    .find((entry) => entry.startsWith(`${LOCALE_COOKIE}=`))
    ?.split("=")[1];
  return DICTIONARIES[resolveLocale(cookie, request.headers.get("accept-language"))];
}
