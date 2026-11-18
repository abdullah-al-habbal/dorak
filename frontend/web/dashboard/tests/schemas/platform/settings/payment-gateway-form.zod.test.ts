import { describe, expect, it } from "vitest";

import { GATEWAY_SORT_MAX } from "@/config/platform/payment-gateway.constant";
import { enDictionary } from "@/locales/en/index.constant";
import { createPaymentGatewayFormSchema } from "@/schemas/platform/settings/payment-gateway-form.zod";

const messages = enDictionary.settings.gateways.form;
const schema = createPaymentGatewayFormSchema(messages);
const valid = { code: "stripe_live", name_en: "Stripe", name_ar: "سترايب", driver: "offline", sort: "0", is_active: true, is_default: false, rows: [] };

function issues(input: unknown): [string, string][] {
  return (schema.safeParse(input).error?.issues ?? []).map((issue) => [String(issue.path[0]), issue.message]);
}

describe("payment gateway form schema", () => {
  it("accepts a complete gateway with or without credentials", () => {
    expect(schema.safeParse(valid).success).toBe(true);
    expect(schema.safeParse({ ...valid, rows: [{ key: "secret", value: "x" }, { key: "", value: "" }] }).success).toBe(true);
  });

  it.each(["", "Has Space", "UPPER", "dash-ed"])("rejects %j as a code", (code) => {
    expect(issues({ ...valid, code })).toEqual([["code", messages.required]]);
  });

  it("requires both names", () => {
    expect(issues({ ...valid, name_en: " ", name_ar: "" })).toEqual([["name_en", messages.required], ["name_ar", messages.required]]);
  });

  it.each(["-1", "1.5", "x", String(GATEWAY_SORT_MAX + 1)])("rejects %s as an order", (sort) => {
    expect(issues({ ...valid, sort })).toEqual([["sort", messages.invalidSort]]);
  });

  it("rejects a repeated credential key, ignoring blanks and spacing", () => {
    expect(issues({ ...valid, rows: [{ key: "secret", value: "1" }, { key: " secret ", value: "2" }] })).toEqual([["rows", messages.duplicateKey]]);
    expect(schema.safeParse({ ...valid, rows: [{ key: "", value: "1" }, { key: "", value: "2" }] }).success).toBe(true);
  });
});
