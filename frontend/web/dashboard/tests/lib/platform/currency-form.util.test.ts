import { describe, expect, it } from "vitest";

import {
  currencyToForm,
  formToCurrencyPayload,
  formToRatePayload,
  isValidRatePair,
  mapCurrencyFieldName,
  mapRateFieldName,
  normalizeCurrencyCode,
  resolveRatePair,
} from "@/lib/platform/currency-form.util";
import type { AdminCurrency } from "@/types/platform/currency-admin.type";

const currency = { id: "c1", code: "EUR", name: { en: "Euro", ar: "يورو" }, symbol: "€" } as unknown as AdminCurrency;

describe("currency mapping", () => {
  it("starts empty for a new currency and from the record for an edit", () => {
    expect(currencyToForm(undefined)).toEqual({ code: "", name_en: "", name_ar: "", symbol: "" });
    expect(currencyToForm(currency)).toEqual({ code: "EUR", name_en: "Euro", name_ar: "يورو", symbol: "€" });
  });

  it("sends the code only when creating, with trimmed text", () => {
    const values = { code: "EUR", name_en: " Euro ", name_ar: "يورو", symbol: " € " };
    expect(formToCurrencyPayload(values, false)).toEqual({ code: "EUR", name: { en: "Euro", ar: "يورو" }, symbol: "€" });
    expect(formToCurrencyPayload(values, true)).toEqual({ name: { en: "Euro", ar: "يورو" }, symbol: "€" });
  });

  it("keeps capital letters only in the code", () => {
    expect(normalizeCurrencyCode("eu1r-")).toBe("EUR");
  });

  it("maps backend field names", () => {
    expect(mapCurrencyFieldName("name_en")).toBe("name_en");
    expect(mapCurrencyFieldName("code")).toBe("code");
    expect(mapCurrencyFieldName("is_active")).toBe("root");
  });
});

describe("rate mapping", () => {
  const codes = ["USD", "EUR", "GBP"];

  it("defaults the pair to the first two different active currencies", () => {
    expect(resolveRatePair({ from: "", to: "" }, codes)).toEqual({ from: "USD", to: "EUR" });
    expect(resolveRatePair({ from: "EUR", to: "" }, codes)).toEqual({ from: "EUR", to: "USD" });
    expect(resolveRatePair({ from: "GBP", to: "GBP" }, codes)).toEqual({ from: "GBP", to: "GBP" });
  });

  it("rejects an empty or same-currency pair", () => {
    expect(isValidRatePair({ from: "USD", to: "EUR" })).toBe(true);
    expect(isValidRatePair({ from: "USD", to: "USD" })).toBe(false);
    expect(isValidRatePair(resolveRatePair({ from: "", to: "" }, []))).toBe(false);
    expect(isValidRatePair(resolveRatePair({ from: "", to: "" }, ["USD"]))).toBe(false);
  });

  it("builds the payload, leaving effective_at out when blank", () => {
    const pair = { from: "USD", to: "EUR" };
    expect(formToRatePayload({ from: "", to: "", rate: " 0.92 ", effective: "" }, pair)).toEqual({ from_currency_code: "USD", to_currency_code: "EUR", rate_ratio: "0.92" });
    const dated = formToRatePayload({ from: "", to: "", rate: "1", effective: "2026-05-01T10:30" }, pair);
    expect(dated.effective_at).toBe(new Date("2026-05-01T10:30").toISOString());
  });

  it("maps backend field names", () => {
    expect(mapRateFieldName("rate_ratio")).toBe("rate");
    expect(mapRateFieldName("from_currency_code")).toBe("from");
    expect(mapRateFieldName("effective_at")).toBe("effective");
  });
});
