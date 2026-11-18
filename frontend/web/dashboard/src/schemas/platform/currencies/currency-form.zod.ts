import { z } from "zod";

import { CURRENCY_CODE_LENGTH, CURRENCY_NAME_MAX, CURRENCY_SYMBOL_MAX, RATE_PATTERN } from "@/config/platform/currency-admin.constant";
import { nameField } from "@/schemas/fields/name-field.zod";
import type { Dictionary } from "@/types/core/shared/dictionary.type";

/** The code is chosen once, so only a new currency needs it; an edit leaves it out. */
export function createCurrencyFormSchema(messages: Dictionary["currencies"]["form"], editing: boolean) {
  return z
    .object({
      code: z.string().optional(),
      name_en: nameField(CURRENCY_NAME_MAX, messages.required),
      name_ar: nameField(CURRENCY_NAME_MAX, messages.required),
      symbol: nameField(CURRENCY_SYMBOL_MAX, messages.required),
    })
    .refine((values) => editing || values.code?.length === CURRENCY_CODE_LENGTH, { message: messages.required, path: ["code"] });
}

export function createRateFormSchema(messages: Dictionary["currencies"]["rateForm"]) {
  return z.object({
    from: z.string(),
    to: z.string(),
    rate: z.string().refine((text) => RATE_PATTERN.test(text.trim()) && Number(text) > 0, messages.invalidRate),
    /** A `datetime-local` value, or "" to take effect now. */
    effective: z.string(),
  });
}
