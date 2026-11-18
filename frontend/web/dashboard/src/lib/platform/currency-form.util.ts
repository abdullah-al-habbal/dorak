import { createFieldNameMapper } from "@/lib/core/errors/apply-form-error.util";
import { toLocalePair } from "@/lib/core/format/locale-pair.util";
import type { CurrencyPayload, ExchangeRatePayload } from "@/services/api/mutation/platform/currency-admin.mutation";
import type { CurrencyFormValues, RateFormValues } from "@/types/platform/currencies/currency-form-values.type";
import type { AdminCurrency } from "@/types/platform/currency-admin.type";

export function currencyToForm(currency: AdminCurrency | undefined): CurrencyFormValues {
  const name = toLocalePair(currency?.name);
  return { code: currency?.code ?? "", name_en: name.en, name_ar: name.ar, symbol: currency?.symbol ?? "" };
}

/** The code is only sent when creating. */
export function formToCurrencyPayload(values: CurrencyFormValues, editing: boolean): CurrencyPayload {
  return {
    ...(editing ? {} : { code: values.code }),
    name: { en: values.name_en.trim(), ar: values.name_ar.trim() },
    symbol: values.symbol.trim(),
  };
}

/** The code input accepts capital letters only. */
export function normalizeCurrencyCode(value: string): string {
  return value.toUpperCase().replace(/[^A-Z]/g, "");
}

export const mapCurrencyFieldName = createFieldNameMapper({ code: "code", name_en: "name_en", name_ar: "name_ar", symbol: "symbol" });

export interface RatePair {
  from: string;
  to: string;
}

/** An untouched side defaults to the first active currency (the other side to the first one that differs). */
export function resolveRatePair(values: Pick<RateFormValues, "from" | "to">, activeCodes: readonly string[]): RatePair {
  const from = values.from || activeCodes[0] || "";
  const to = values.to || activeCodes.find((code) => code !== from) || "";
  return { from, to };
}

export function isValidRatePair(pair: RatePair): boolean {
  return pair.from !== "" && pair.to !== "" && pair.from !== pair.to;
}

/** A blank effective time is left out, so the rate takes effect now. */
export function formToRatePayload(values: RateFormValues, pair: RatePair): ExchangeRatePayload {
  return {
    from_currency_code: pair.from,
    to_currency_code: pair.to,
    rate_ratio: values.rate.trim(),
    ...(values.effective ? { effective_at: new Date(values.effective).toISOString() } : {}),
  };
}

export const mapRateFieldName = createFieldNameMapper({ from_currency_code: "from", to_currency_code: "to", rate_ratio: "rate", effective_at: "effective" });
