import { describe, expect, it } from "vitest";

import { formToGatewayPayload, gatewayToForm, mapGatewayFieldName, normalizeGatewayCode } from "@/lib/platform/payment-gateway-form.util";
import type { PaymentGateway } from "@/types/platform/payment-gateway.type";

const gateway = {
  id: "g1", code: "stripe", name: { en: "Stripe", ar: "سترايب" }, driver: "generic_http", is_active: false, is_default: false, sort_order: 4, gateway_setting_keys: ["secret"],
} as unknown as PaymentGateway;

describe("payment gateway mapping", () => {
  it("starts a new gateway active, offline and without credentials", () => {
    expect(gatewayToForm(undefined)).toMatchObject({ code: "", driver: "offline", sort: "0", is_active: true, is_default: false, rows: [] });
  });

  it("starts an edit from the record with no credential rows (they are write-only)", () => {
    expect(gatewayToForm(gateway)).toMatchObject({ code: "stripe", name_en: "Stripe", driver: "generic_http", sort: "4", is_active: false, rows: [] });
  });

  it("normalises the code to lowercase letters, digits and underscores", () => {
    expect(normalizeGatewayCode("Stripe-Live 2_x")).toBe("stripelive2_x");
  });

  it("omits gateway_settings when no row has a key, so stored credentials are kept", () => {
    const payload = formToGatewayPayload({ ...gatewayToForm(gateway), rows: [{ key: " ", value: "ignored" }] });
    expect("gateway_settings" in payload).toBe(false);
    expect(payload).toMatchObject({ code: "stripe", name: { en: "Stripe", ar: "سترايب" }, sort_order: 4, is_active: false });
  });

  it("sends trimmed credential keys with their values, which replaces the stored ones", () => {
    const payload = formToGatewayPayload({ ...gatewayToForm(gateway), rows: [{ key: " secret ", value: " v " }, { key: "", value: "" }] });
    expect(payload.gateway_settings).toEqual({ secret: " v " });
  });

  it("forces the default gateway to be active", () => {
    expect(formToGatewayPayload({ ...gatewayToForm(gateway), is_active: false, is_default: true })).toMatchObject({ is_active: true, is_default: true });
  });

  it("maps backend field names", () => {
    expect(mapGatewayFieldName("sort_order")).toBe("sort");
    expect(mapGatewayFieldName("gateway_settings.secret")).toBe("rows");
    expect(mapGatewayFieldName("unknown")).toBe("root");
  });
});
