import type { Locale } from "@/i18n/locales.types";

export function formatCurrency(
  value: number,
  locale: Locale,
  currency: string,
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 1,
  }).format(value);
}
