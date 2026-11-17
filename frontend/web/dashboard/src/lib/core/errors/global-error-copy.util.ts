import { LOCALE_DIRECTION } from "@/config/locales.constant";
import { Locale } from "@/enums/access/locale.enum";
import { arCommon } from "@/locales/ar/common.constant";
import { arErrors } from "@/locales/ar/errors.constant";
import { enCommon } from "@/locales/en/common.constant";
import { enErrors } from "@/locales/en/errors.constant";
import { resolveLocale } from "@/locales/resolve-locale.util";

/** Only the two namespaces `global-error` shows. Importing `DICTIONARIES` here would ship both whole dictionaries to every route. */
const GLOBAL_ERROR_COPY = {
  [Locale.En]: { errors: enErrors, common: enCommon },
  [Locale.Ar]: { errors: arErrors, common: arCommon },
} as const;

/** The copy `global-error` shows. It renders without the locale provider, so it reads the dictionaries directly. */
export function globalErrorView(cookieValue: string | undefined, acceptLanguage: string | undefined) {
  const locale = resolveLocale(cookieValue, acceptLanguage);
  const { errors, common } = GLOBAL_ERROR_COPY[locale];
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
