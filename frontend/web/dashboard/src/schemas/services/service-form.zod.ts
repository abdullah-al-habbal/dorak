import { z } from "zod";

import { NAME_MAX_LENGTH } from "@/config/money-shell/field-limit.constant";
import { parseDuration } from "@/lib/core/format/duration.util";
import { parseMinorUnits } from "@/lib/core/format/money.util";
import { nameField } from "@/schemas/fields/name-field.zod";
import type { Dictionary } from "@/types/core/shared/dictionary.type";

type ServiceValidation = Dictionary["services"]["form"]["validation"];

export function createServiceSchema(messages: ServiceValidation) {
  return z.object({
    name_en: nameField(NAME_MAX_LENGTH, messages.name),
    name_ar: nameField(NAME_MAX_LENGTH, messages.name),
    price: z.string().refine((value) => parseMinorUnits(value) !== null, messages.price),
    currency_code: z.string().min(1, messages.currency),
    /** Empty string means no category. */
    category_id: z.string(),
    duration: z.string().refine((value) => parseDuration(value) !== undefined, messages.duration),
    is_at_home: z.boolean(),
    is_active: z.boolean(),
  });
}

export type ServiceFormValues = z.input<ReturnType<typeof createServiceSchema>>;
