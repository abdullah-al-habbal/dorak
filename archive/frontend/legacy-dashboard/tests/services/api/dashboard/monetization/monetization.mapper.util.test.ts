import { describe, expect, it } from "vitest";
import {
  commissionRulePayload,
  gatewayPayload,
  planPayload,
  mapAnalytics,
  mapCommissionEntry,
  mapCommissionRule,
  mapGateway,
  mapPayout,
  mapPlan,
  mapSubscription,
} from "@/services/api/dashboard/monetization/monetization.mapper.util";

describe("monetization mappers", () => {
  it("maps a plan from the wire, tolerating missing fields", () => {
    expect(
      mapPlan({
        id: "p1",
        name: { en: "Pro", ar: "محترف" },
        description: { en: "x", ar: "y" },
        price_amount_minor: 4900,
        currency: { id: "c1", code: "JOD" },
        interval_unit: "month",
        interval_count: 1,
        is_active: true,
        feature_keys: ["multi_branch", 3],
      }),
    ).toEqual({
      id: "p1",
      name: { en: "Pro", ar: "محترف" },
      description: { en: "x", ar: "y" },
      priceMinor: 4900,
      currency: { id: "c1", code: "JOD" },
      intervalUnit: "month",
      intervalCount: 1,
      isActive: true,
      featureKeys: ["multi_branch"],
    });
    expect(mapPlan({ id: "p2", interval_unit: "week" }).currency).toBeNull();
  });

  it("rejects an unknown interval unit", () => {
    expect(() => mapPlan({ id: "p", interval_unit: "fortnight" })).toThrow();
  });

  it("maps subscriptions with the localized brand and plan names", () => {
    expect(
      mapSubscription({
        id: "s1",
        status: "past_due",
        brand: { id: "b1", name: { en: "Brand", ar: "علامة" } },
        plan: { id: "p1", name: { en: "", ar: "خطة" } },
        ends_at: "2026-11-01T00:00:00+00:00",
      }),
    ).toEqual({
      id: "s1",
      status: "past_due",
      brandId: "b1",
      brandName: "Brand",
      planName: "خطة",
      endsAt: "2026-11-01T00:00:00+00:00",
    });
  });

  it("falls back to the offline driver for an unknown gateway driver", () => {
    expect(mapGateway({ id: "g2", code: "x", driver: "wallet" }).driver).toBe(
      "offline",
    );
  });

  it("maps gateways without ever reading config values", () => {
    const gateway = mapGateway({
      id: "g1",
      code: "pay_at_salon",
      name: { en: "Pay at salon", ar: "الدفع" },
      driver: "offline",
      is_active: true,
      is_default: true,
      gateway_setting_keys: ["merchant_id"],
      gateway_settings: { secret: "x" },
    });
    expect(gateway.gatewaySettingKeys).toEqual(["merchant_id"]);
    expect(JSON.stringify(gateway)).not.toContain("secret");
  });

  it("maps commission rules and entries", () => {
    expect(
      mapCommissionRule({
        id: "r1",
        scope: "brand",
        scope_id: "b1",
        type: "flat",
        value_amount_minor: 250,
        currency: { id: "c1", code: "JOD" },
        is_active: false,
      }),
    ).toMatchObject({
      scope: "brand",
      scopeId: "b1",
      valueBps: null,
      valueAmountMinor: 250,
      isActive: false,
    });
    expect(
      mapCommissionEntry({
        id: "e1",
        booking_id: "bk",
        base_amount_minor: 15050,
        commission_amount_minor: 1505,
        currency: { id: "c1", code: "JOD" },
        payout_id: "po",
      }),
    ).toMatchObject({
      settled: true,
      currencyCode: "JOD",
      commissionMinor: 1505,
    });
    expect(mapCommissionEntry({ id: "e2", payout_id: null }).settled).toBe(
      false,
    );
  });

  it("maps payouts", () => {
    expect(
      mapPayout({
        id: "po1",
        status: "approved",
        brand: { id: "b", name: { en: "Brand", ar: "" } },
        total_amount_minor: 900,
        currency: { id: "c", code: "JOD" },
        external_reference: null,
      }),
    ).toEqual({
      id: "po1",
      status: "approved",
      brandName: "Brand",
      totalMinor: 900,
      currencyCode: "JOD",
      externalReference: null,
    });
  });

  it("maps the analytics overview and survives an empty payload", () => {
    expect(
      mapAnalytics({
        subscriptions: {
          by_plan: [{ plan_id: "p1", subscriptions: 2 }],
          recurring_revenue: [{ currency: "JOD", total_amount_minor: 10000 }],
        },
        commission: {
          pending: [{ currency: "JOD", total_amount_minor: 400 }],
          settled: [{ currency: "JOD", total_amount_minor: 900 }],
        },
        payouts: [
          {
            status: "paid",
            currency: "JOD",
            payouts: 1,
            total_amount_minor: 900,
          },
        ],
        completed_bookings: 3,
      }),
    ).toEqual({
      subscriptionsByPlan: [{ planId: "p1", subscriptions: 2 }],
      recurringRevenue: [{ currency: "JOD", totalMinor: 10000 }],
      commissionPending: [{ currency: "JOD", totalMinor: 400 }],
      commissionSettled: [{ currency: "JOD", totalMinor: 900 }],
      payouts: [
        { status: "paid", currency: "JOD", payouts: 1, totalMinor: 900 },
      ],
      completedBookings: 3,
    });
    expect(mapAnalytics(null).completedBookings).toBe(0);
  });
});

describe("monetization payload builders", () => {
  it("sends plans as snake_case with minor-unit prices", () => {
    expect(
      planPayload({
        nameEn: "Pro",
        nameAr: "محترف",
        descriptionEn: "",
        descriptionAr: "وصف",
        price: 49,
        currencyCode: "c1",
        intervalUnit: "month",
        intervalCount: 1,
        isActive: true,
        featureKeys: ["job_board"],
      }),
    ).toEqual({
      name: { en: "Pro", ar: "محترف" },
      description: { en: null, ar: "وصف" },
      price_amount_minor: 4900,
      currency_code: "c1",
      interval_unit: "month",
      interval_count: 1,
      is_active: true,
      feature_keys: ["job_board"],
    });
  });

  it("omits gateway config when empty and parses it otherwise", () => {
    const form = {
      code: "wallet",
      nameEn: "Wallet",
      nameAr: "محفظة",
      driver: "offline" as const,
      isActive: true,
      isDefault: false,
      gatewaySettings: "",
    };
    expect(gatewayPayload(form)).not.toHaveProperty("gateway_settings");
    expect(
      gatewayPayload({ ...form, gatewaySettings: "merchant=m1" }),
    ).toMatchObject({
      gateway_settings: { merchant: "m1" },
      is_default: false,
    });
  });

  it("converts percent rules to basis points and flat rules to minor units", () => {
    expect(
      commissionRulePayload({
        scope: "global",
        scopeId: "ignored",
        type: "percent",
        value: 12.5,
        currencyCode: "ignored",
        isActive: true,
      }),
    ).toEqual({
      scope: "global",
      scope_id: null,
      type: "percent",
      value_bps: 1250,
      currency_code: null,
      is_active: true,
    });
    expect(
      commissionRulePayload({
        scope: "branch",
        scopeId: "br1",
        type: "flat",
        value: 2.5,
        currencyCode: "c1",
        isActive: false,
      }),
    ).toEqual({
      scope: "branch",
      scope_id: "br1",
      type: "flat",
      value_amount_minor: 250,
      currency_code: "c1",
      is_active: false,
    });
  });
});
