import { describe, expect, it } from "vitest";

import { enDictionary } from "@/locales/en/index.constant";
import { createCurrencyFormSchema, createRateFormSchema } from "@/schemas/platform/currencies/currency-form.zod";

const { form, rateForm } = enDictionary.currencies;

function failedFields(result: { success: boolean; error?: { issues: { path: PropertyKey[] }[] } }): string[] {
  return (result.error?.issues ?? []).map((issue) => String(issue.path[0])).sort();
}

describe("currency form schema", () => {
  const valid = { code: "EUR", name_en: "Euro", name_ar: "يورو", symbol: "€" };

  it("accepts a complete new currency and trims the text", () => {
    expect(createCurrencyFormSchema(form, false).parse({ ...valid, symbol: " € " }).symbol).toBe("€");
  });

  it("requires a 3-letter code only when creating", () => {
    expect(failedFields(createCurrencyFormSchema(form, false).safeParse({ ...valid, code: "EU" }))).toEqual(["code"]);
    expect(createCurrencyFormSchema(form, true).safeParse({ ...valid, code: undefined }).success).toBe(true);
  });

  it("requires both names and the symbol", () => {
    expect(failedFields(createCurrencyFormSchema(form, true).safeParse({ ...valid, name_en: " ", name_ar: "", symbol: "" }))).toEqual(["name_ar", "name_en", "symbol"]);
  });
});

describe("rate form schema", () => {
  const schema = createRateFormSchema(rateForm);
  const valid = { from: "USD", to: "EUR", rate: "0.92", effective: "" };

  it.each(["1", "0.92", " 1.234567 "])("accepts %s", (rate) => {
    expect(schema.safeParse({ ...valid, rate }).success).toBe(true);
  });

  it.each(["", "0", "0.0", "-1", "1.1234567", "abc", "1,5"])("rejects %j with the rate message", (rate) => {
    const result = schema.safeParse({ ...valid, rate });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(rateForm.invalidRate);
  });
});
