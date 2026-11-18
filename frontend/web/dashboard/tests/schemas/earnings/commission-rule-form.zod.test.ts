import { describe, expect, it } from "vitest";

import { CommissionScope, CommissionType } from "@/enums/money/commission.enum";
import { enDictionary } from "@/locales/en/index.constant";
import { createCommissionRuleFormSchema } from "@/schemas/earnings/commission-rule-form.zod";

const messages = enDictionary.commissions.form;
const schema = createCommissionRuleFormSchema(messages);
const percentRule = { scope: CommissionScope.Global, scope_id: "", type: CommissionType.Percent, percent: "12.5", amount: "", currency_code: "", notes: "", is_active: true };
const flatRule = { ...percentRule, type: CommissionType.Flat, percent: "", amount: "25.50" };

function issues(input: unknown): [string, string][] {
  return (schema.safeParse(input).error?.issues ?? []).map((issue) => [String(issue.path[0]), issue.message]);
}

describe("commission rule form schema", () => {
  it("accepts a percent rule and a flat rule", () => {
    expect(schema.safeParse(percentRule).success).toBe(true);
    expect(schema.safeParse(flatRule).success).toBe(true);
  });

  it.each(["", "0", "100.01", "1.234", "abc", "-5"])("rejects %j as a percent", (percent) => {
    expect(issues({ ...percentRule, percent })).toEqual([["percent", messages.invalidPercent]]);
  });

  it("does not check the amount of a percent rule, nor the percent of a flat rule", () => {
    expect(schema.safeParse({ ...percentRule, amount: "garbage" }).success).toBe(true);
    expect(schema.safeParse({ ...flatRule, percent: "garbage" }).success).toBe(true);
  });

  it.each(["", "0", "abc", "-3"])("rejects %j as a flat amount", (amount) => {
    expect(issues({ ...flatRule, amount })).toEqual([["amount", messages.invalidAmount]]);
  });

  it("rejects an unknown scope or type", () => {
    expect(schema.safeParse({ ...percentRule, scope: "galaxy" }).success).toBe(false);
    expect(schema.safeParse({ ...percentRule, type: "weird" }).success).toBe(false);
  });
});
