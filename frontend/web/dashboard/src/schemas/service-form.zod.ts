import { z } from "zod";

import { parseDuration } from "@/lib/duration.util";
import { parseMinorUnits } from "@/lib/money.util";
import type { Dictionary } from "@/types/dictionary.type";

const MAX_NAME = 120;

type ServiceValidation = Dictionary["services"]["form"]["validation"];

export function createServiceSchema(messages: ServiceValidation) {
  return z.object({
    name_en: z.string().trim().min(1, messages.name).max(MAX_NAME, messages.name),
    name_ar: z.string().trim().min(1, messages.name).max(MAX_NAME, messages.name),
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
