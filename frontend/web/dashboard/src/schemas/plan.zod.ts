import { z } from "zod";

import { SubscriptionInterval } from "@/enums/subscription-interval.enum";
import { localizedTextSchema } from "@/schemas/localized-text.zod";

/** A translatable field the backend has no value for serializes as an empty array. */
const optionalLocalizedSchema = z.union([localizedTextSchema, z.tuple([])]).nullable().optional();

export const planSchema = z.object({
  id: z.string(),
  name: localizedTextSchema,
  description: optionalLocalizedSchema,
  price_amount_minor: z.number(),
  currency: z.object({ code: z.string() }).nullable().optional(),
  interval_unit: z.enum(SubscriptionInterval),
  interval_count: z.number(),
  is_active: z.boolean(),
  sort_order: z.number(),
  feature_keys: z.array(z.string()).optional().default([]),
  created_at: z.string().optional(),
});

export const planListSchema = z.array(planSchema);

export const planFeatureKeysSchema = z.array(z.string());
