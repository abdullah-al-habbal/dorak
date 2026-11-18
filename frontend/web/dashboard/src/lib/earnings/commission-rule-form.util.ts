import { CommissionScope, CommissionType } from "@/enums/money/commission.enum";
import { createFieldNameMapper } from "@/lib/core/errors/apply-form-error.util";
import { minorUnitsToInput, parseMinorUnits } from "@/lib/core/format/money.util";
import { bpsToPercent, percentToBps } from "@/lib/earnings/commission.util";
import type { CommissionRulePayload } from "@/services/api/mutation/earnings/commission.mutation";
import type { CommissionRule } from "@/types/earnings/commission.type";
import type { CommissionRuleFormValues } from "@/types/earnings/forms/commission-rule-form-values.type";

export function ruleToForm(rule: CommissionRule | undefined): CommissionRuleFormValues {
  return {
    scope: rule?.scope ?? CommissionScope.Global,
    scope_id: rule?.scope_id ?? "",
    type: rule?.type ?? CommissionType.Percent,
    percent: rule?.value_bps ? bpsToPercent(rule.value_bps) : "",
    amount: rule?.value_amount_minor ? minorUnitsToInput(rule.value_amount_minor) : "",
    currency_code: rule?.currency?.code ?? "",
    notes: rule?.notes ?? "",
    is_active: rule?.is_active ?? true,
  };
}

export interface CommissionChoices {
  /** `null` for a global rule; otherwise the chosen brand or branch (the first loaded one when none was picked). */
  scopeId: string | null;
  currency: string;
}

export function resolveCommissionChoices(values: Pick<CommissionRuleFormValues, "scope" | "scope_id" | "currency_code">, targetIds: readonly string[], currencyCodes: readonly string[]): CommissionChoices {
  const scopeId = values.scope === CommissionScope.Global ? null : values.scope_id || targetIds[0] || "";
  return { scopeId, currency: values.currency_code || currencyCodes[0] || "" };
}

/** A flat rule needs a currency, and a brand or branch rule needs its target. */
export function missingCommissionChoice(values: Pick<CommissionRuleFormValues, "type">, choices: CommissionChoices): "scope_id" | "amount" | undefined {
  if (choices.scopeId === "") return "scope_id";
  if (values.type === CommissionType.Flat && choices.currency === "") return "amount";
  return undefined;
}

/** The form is validated first: a percent rule sends `value_bps`, a flat rule `value_amount_minor` and its currency. */
export function formToRulePayload(values: CommissionRuleFormValues, choices: CommissionChoices): CommissionRulePayload {
  const base = { scope: values.scope, scope_id: choices.scopeId, type: values.type, is_active: values.is_active, notes: values.notes.trim() === "" ? null : values.notes.trim() };
  if (values.type === CommissionType.Percent) return { ...base, value_bps: percentToBps(values.percent) ?? 0 };
  return { ...base, value_amount_minor: parseMinorUnits(values.amount) ?? 0, currency_code: choices.currency };
}

export const mapRuleFieldName = createFieldNameMapper({
  scope: "scope",
  scope_id: "scope_id",
  type: "type",
  value_bps: "percent",
  value_amount_minor: "amount",
  currency_code: "currency_code",
  notes: "notes",
  is_active: "is_active",
});
