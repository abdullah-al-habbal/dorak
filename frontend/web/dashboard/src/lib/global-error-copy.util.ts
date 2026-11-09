import { LOCALE_DIRECTION } from "@/config/locales.constant";
import { DICTIONARIES } from "@/locales/dictionaries.constant";
import { resolveLocale } from "@/locales/resolve-locale.util";

/** The copy `global-error` shows. It renders without the locale provider, so it reads the dictionaries directly. */
export function globalErrorView(cookieValue: string | undefined, acceptLanguage: string | undefined) {
  const locale = resolveLocale(cookieValue, acceptLanguage);
  const { errors, common } = DICTIONARIES[locale];
  return {
    locale,
    direction: LOCALE_DIRECTION[locale],
    title: errors.generic.title,
    body: errors.generic.body,
    reference: errors.reference,
    retry: common.retry,
    home: errors.backToWorkspace,
  };
}
