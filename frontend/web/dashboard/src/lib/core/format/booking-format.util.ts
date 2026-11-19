import { DECIMALS, MINOR_UNIT_FACTOR } from "@/lib/core/format/money.util";
import type { Booking } from "@/types/bookings/booking.type";

type Localized = string | Record<string, string | null> | null | undefined;

export function localizedText(value: Localized, locale: string): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[locale] ?? Object.values(value).find(Boolean) ?? "";
}

export function formatTime(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}

export function formatDay(date: Date, locale: string, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(locale, options).format(date);
}

/**
 * Every currency is stored in hundredths (BG-13), so show exactly two decimals: Intl would otherwise follow the ISO
 * exponent and show SYP 12.50 as "SYP 13".
 */
export function formatPrice(minorUnits: number, currency: string | null | undefined, locale: string): string {
  const fractionDigits = { minimumFractionDigits: DECIMALS, maximumFractionDigits: DECIMALS };
  const major = minorUnits / MINOR_UNIT_FACTOR;
  if (!currency) return new Intl.NumberFormat(locale, fractionDigits).format(major);
  return new Intl.NumberFormat(locale, { style: "currency", currency, ...fractionDigits }).format(major);
}

export function bookingTotal(booking: Booking, locale: string): string {
  const priced = booking.services.filter((service) => service.price_amount_minor != null);
  if (priced.length === 0) return "";
  const total = priced.reduce((sum, service) => sum + (service.price_amount_minor ?? 0), 0);
  return formatPrice(total, priced[0].currency_code, locale);
}

export function serviceSummary(booking: Booking, locale: string): string {
  return booking.services.map((service) => localizedText(service.name, locale)).filter(Boolean).join(", ");
}
