import { SubscriptionInterval } from "@/enums/money/subscription-interval.enum";
import { minorUnitsToInput, parseMinorUnits } from "@/lib/core/format/money.util";
import type { PlanPayload } from "@/interfaces/plans/plan-payload.interface";
import type { PlanFormValues } from "@/schemas/plans/plan-form.zod";
import type { Plan } from "@/types/plans/plan.type";

const DEFAULT_INTERVAL_COUNT = "1";

type Translatable = Plan["name"] | Plan["description"];

/** One locale of a translatable field; absent translations (or the empty array the backend sends) read as "". */
function translation(value: Translatable, locale: "en" | "ar"): string {
  if (!value || typeof value === "string" || Array.isArray(value)) return typeof value === "string" ? value : "";
  return value[locale] ?? "";
}

export function emptyPlanForm(currencyCode: string): PlanFormValues {
  return {
    name_en: "",
    name_ar: "",
    description_en: "",
    description_ar: "",
    price: "",
    currency_code: currencyCode,
    interval_unit: SubscriptionInterval.Month,
    interval_count: DEFAULT_INTERVAL_COUNT,
    sort_order: "0",
    is_active: true,
    feature_keys: [],
  };
}

export function planToForm(plan: Plan): PlanFormValues {
  return {
    name_en: translation(plan.name, "en"),
    name_ar: translation(plan.name, "ar"),
    description_en: translation(plan.description, "en"),
    description_ar: translation(plan.description, "ar"),
    price: minorUnitsToInput(plan.price_amount_minor),
    currency_code: plan.currency?.code ?? "",
    interval_unit: plan.interval_unit,
    interval_count: String(plan.interval_count),
    sort_order: String(plan.sort_order),
    is_active: plan.is_active,
    feature_keys: [...plan.feature_keys],
  };
}

/** Values are validated first, so the price always parses; the `?? 0` only satisfies the type. */
export function formToPlanPayload(values: PlanFormValues): PlanPayload {
  const orNull = (text: string): string | null => (text.trim() === "" ? null : text.trim());
  return {
    name: { en: values.name_en.trim(), ar: values.name_ar.trim() },
    description: { en: orNull(values.description_en), ar: orNull(values.description_ar) },
    price_amount_minor: parseMinorUnits(values.price) ?? 0,
    currency_code: values.currency_code,
    interval_unit: values.interval_unit,
    interval_count: Number(values.interval_count),
    is_active: values.is_active,
    sort_order: values.sort_order.trim() === "" ? 0 : Number(values.sort_order),
    feature_keys: values.feature_keys,
  };
}
