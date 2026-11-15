import { z } from "zod";

import { PLAN_MAX_DESCRIPTION, PLAN_MAX_INTERVAL_COUNT, PLAN_MAX_NAME, PLAN_MAX_SORT_ORDER } from "@/config/plan.constant";
import { SubscriptionInterval } from "@/enums/subscription-interval.enum";
import { parseMinorUnits } from "@/lib/core/money.util";
import { nameField } from "@/schemas/fields/name-field.zod";
import type { Dictionary } from "@/types/core/dictionary.type";

type PlanValidation = Dictionary["plans"]["form"]["validation"];

function integerInRange(text: string, min: number, max: number): boolean {
  const value = Number(text.trim());
  return text.trim() !== "" && Number.isInteger(value) && value >= min && value <= max;
}

/** Mirrors `SavePlanRequest`; messages come from the dictionary so validation reads in the active locale. */
export function createPlanSchema(messages: PlanValidation) {
  return z.object({
    name_en: nameField(PLAN_MAX_NAME, messages.name),
    name_ar: nameField(PLAN_MAX_NAME, messages.name),
    description_en: z.string().trim().max(PLAN_MAX_DESCRIPTION, messages.description),
    description_ar: z.string().trim().max(PLAN_MAX_DESCRIPTION, messages.description),
    price: z.string().refine((value) => parseMinorUnits(value) !== null, messages.price),
    currency_code: z.string().min(1, messages.currency),
    interval_unit: z.enum(SubscriptionInterval, messages.intervalUnit),
    interval_count: z.string().refine((value) => integerInRange(value, 1, PLAN_MAX_INTERVAL_COUNT), messages.intervalCount),
    sort_order: z.string().refine((value) => value.trim() === "" || integerInRange(value, 0, PLAN_MAX_SORT_ORDER), messages.sortOrder),
    is_active: z.boolean(),
    feature_keys: z.array(z.string()),
  });
}

export type PlanFormValues = z.input<ReturnType<typeof createPlanSchema>>;
