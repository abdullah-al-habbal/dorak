import { describe, expect, it } from "vitest";
import {
  assignSubscriptionFormSchema,
  commissionRuleFormSchema,
  gatewayFormSchema,
  planFormSchema,
} from "@/services/api/dashboard/monetization/schemas/monetization.schema";

const plan = {
  nameEn: "Pro",
  nameAr: "محترف",
  descriptionEn: "",
  descriptionAr: "",
  price: "49",
  currencyCode: "c1",
  intervalUnit: "month",
  intervalCount: "1",
  isActive: true,
  featureKeys: "multi_branch",
};

describe("planFormSchema", () => {
  it("coerces numbers and wraps a lone checkbox value in an array", () => {
    expect(planFormSchema.parse(plan)).toMatchObject({
      price: 49,
      intervalCount: 1,
      featureKeys: ["multi_branch"],
    });
    expect(
      planFormSchema.parse({ ...plan, featureKeys: false }).featureKeys,
    ).toEqual([]);
  });

  it("rejects a missing name, a negative price and an unknown interval", () => {
    expect(planFormSchema.safeParse({ ...plan, nameEn: " " }).success).toBe(
      false,
    );
    expect(planFormSchema.safeParse({ ...plan, price: "-1" }).success).toBe(
      false,
    );
    expect(
      planFormSchema.safeParse({ ...plan, intervalUnit: "fortnight" }).success,
    ).toBe(false);
  });
});

describe("assignSubscriptionFormSchema", () => {
  it("requires a brand and a plan", () => {
    expect(
      assignSubscriptionFormSchema.safeParse({ brandId: "", planId: "p" })
        .success,
    ).toBe(false);
    expect(
      assignSubscriptionFormSchema.safeParse({ brandId: "b", planId: "p" })
        .success,
    ).toBe(true);
  });
});

describe("gatewayFormSchema", () => {
  const gateway = {
    code: "syriatel_cash",
    nameEn: "Cash",
    nameAr: "كاش",
    driver: "offline",
    isActive: true,
    isDefault: false,
    config: "",
  };

  it("accepts a snake_case code and rejects anything else", () => {
    expect(gatewayFormSchema.safeParse(gateway).success).toBe(true);
    expect(
      gatewayFormSchema.safeParse({ ...gateway, code: "Bad Code" }).success,
    ).toBe(false);
  });

  it("rejects a driver the backend enum does not define", () => {
    expect(
      gatewayFormSchema.safeParse({ ...gateway, driver: "wallet" }).success,
    ).toBe(false);
  });
});

describe("commissionRuleFormSchema", () => {
  const rule = {
    scope: "global",
    scopeId: "",
    type: "percent",
    value: "10",
    currencyCode: "",
    isActive: true,
  };

  it("accepts a global percent rule", () => {
    expect(commissionRuleFormSchema.parse(rule).value).toBe(10);
  });

  it("requires a scope id for brand and branch rules", () => {
    expect(
      commissionRuleFormSchema.safeParse({ ...rule, scope: "brand" }).success,
    ).toBe(false);
    expect(
      commissionRuleFormSchema.safeParse({
        ...rule,
        scope: "branch",
        scopeId: "x",
      }).success,
    ).toBe(true);
  });

  it("requires a currency for flat fees and caps percent at 100", () => {
    expect(
      commissionRuleFormSchema.safeParse({ ...rule, type: "flat" }).success,
    ).toBe(false);
    expect(
      commissionRuleFormSchema.safeParse({
        ...rule,
        type: "flat",
        currencyCode: "c",
      }).success,
    ).toBe(true);
    expect(
      commissionRuleFormSchema.safeParse({ ...rule, value: "101" }).success,
    ).toBe(false);
    expect(
      commissionRuleFormSchema.safeParse({ ...rule, value: "0" }).success,
    ).toBe(false);
  });
});
