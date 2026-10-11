import type { Locale } from "@/i18n/locales.types";

interface FormatNumberOptions extends Intl.NumberFormatOptions {
  value: number;
  locale: Locale;
}

export function formatNumber({
  value,
  locale,
  notation = "compact",
  compactDisplay = "short",
  maximumFractionDigits = 1,
}: FormatNumberOptions) {
  return new Intl.NumberFormat(locale, {
    notation,
    compactDisplay,
    maximumFractionDigits,
  }).format(value);
}
