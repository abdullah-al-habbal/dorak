import { describe, expect, it } from "vitest";

import { CommissionScope, CommissionType } from "@/enums/money/commission.enum";
import { formToRulePayload, mapRuleFieldName, missingCommissionChoice, resolveCommissionChoices, ruleToForm } from "@/lib/earnings/commission-rule-form.util";
import type { CommissionRule } from "@/types/earnings/commission.type";

const percentRule = { id: "r1", scope: "brand", scope_id: "b1", type: "percent", value_bps: 1250, value_amount_minor: null, currency: null, is_active: false, notes: "n" } as unknown as CommissionRule;

describe("commission rule mapping", () => {
  it("starts a new rule global, percent and active", () => {
    expect(ruleToForm(undefined)).toMatchObject({ scope: CommissionScope.Global, type: CommissionType.Percent, percent: "", amount: "", is_active: true });
  });

  it("reads an existing percent rule, basis points as a percent", () => {
    expect(ruleToForm(percentRule)).toMatchObject({ scope: "brand", scope_id: "b1", percent: "12.5", is_active: false, notes: "n" });
  });

  it("falls back to the first loaded target and currency", () => {
    const base = { scope: CommissionScope.Brand, scope_id: "", currency_code: "" };
    expect(resolveCommissionChoices(base, ["b1", "b2"], ["USD"])).toEqual({ scopeId: "b1", currency: "USD" });
    expect(resolveCommissionChoices({ ...base, scope_id: "b2", currency_code: "EUR" }, ["b1"], ["USD"])).toEqual({ scopeId: "b2", currency: "EUR" });
    expect(resolveCommissionChoices({ ...base, scope: CommissionScope.Global }, ["b1"], ["USD"]).scopeId).toBeNull();
  });

  it("reports a missing target or, for a flat rule, a missing currency", () => {
    expect(missingCommissionChoice({ type: CommissionType.Percent }, { scopeId: "", currency: "USD" })).toBe("scope_id");
    expect(missingCommissionChoice({ type: CommissionType.Flat }, { scopeId: null, currency: "" })).toBe("amount");
    expect(missingCommissionChoice({ type: CommissionType.Percent }, { scopeId: null, currency: "" })).toBeUndefined();
  });

  it("builds a percent payload in basis points with no currency", () => {
    const payload = formToRulePayload({ ...ruleToForm(percentRule), percent: "12.5", notes: "  " }, { scopeId: "b1", currency: "USD" });
    expect(payload).toEqual({ scope: "brand", scope_id: "b1", type: "percent", is_active: false, notes: null, value_bps: 1250 });
  });

  it("builds a flat payload in minor units with its currency", () => {
    const payload = formToRulePayload({ ...ruleToForm(undefined), type: CommissionType.Flat, amount: "25.50" }, { scopeId: null, currency: "USD" });
    expect(payload).toEqual({ scope: "global", scope_id: null, type: "flat", is_active: true, notes: null, value_amount_minor: 2550, currency_code: "USD" });
  });

  it("maps backend field names", () => {
    expect(mapRuleFieldName("value_bps")).toBe("percent");
    expect(mapRuleFieldName("value_amount_minor")).toBe("amount");
    expect(mapRuleFieldName("currency_code")).toBe("currency_code");
    expect(mapRuleFieldName("other")).toBe("root");
  });
});
