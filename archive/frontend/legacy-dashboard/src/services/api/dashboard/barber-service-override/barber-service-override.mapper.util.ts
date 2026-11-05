import { BarberServiceTermsSchema } from "@/services/api/dashboard/barber-service-override/schemas/barber-service-terms.schema";
import type { IBarberServiceTerms } from "@/services/api/dashboard/barber-service-override/types/ibarber-service-terms.types";
import { isRecord } from "@/utils/guards.util";

function nullableNum(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

function mapTerms(wire: unknown): IBarberServiceTerms {
  const item = isRecord(wire) ? wire : {};
  const priceAmountMinor =
    typeof item.price_amount_minor === "number" ? item.price_amount_minor : 0;
  return BarberServiceTermsSchema.parse({
    id: item.id,
    name: item.name,
    currencyCode: item.currency_code ?? "",
    priceAmountMinor,
    durationMinutes: nullableNum(item.duration_minutes),
    defaultPriceAmountMinor:
      typeof item.default_price_amount_minor === "number"
        ? item.default_price_amount_minor
        : priceAmountMinor,
    defaultDurationMinutes: nullableNum(item.default_duration_minutes),
    isOverridden: item.is_overridden === true,
  });
}

export function mapBarberServiceTerms(wire: unknown): IBarberServiceTerms {
  return mapTerms(wire);
}

export function mapBarberServiceTermsList(
  wire: unknown,
): IBarberServiceTerms[] {
  return Array.isArray(wire) ? wire.map(mapTerms) : [];
}
