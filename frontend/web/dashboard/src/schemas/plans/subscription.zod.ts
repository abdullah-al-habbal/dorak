import { z } from "zod";

import { SubscriptionInterval } from "@/enums/subscription-interval.enum";
import { SubscriptionStatus } from "@/enums/subscription-status.enum";
import { localizedTextSchema } from "@/schemas/core/localized-text.zod";

export const subscriptionSchema = z.object({
  id: z.string(),
  status: z.enum(SubscriptionStatus),
  brand: z.object({ id: z.string(), name: localizedTextSchema }),
  plan: z.object({
    id: z.string(),
    name: localizedTextSchema,
    description: localizedTextSchema.nullable().optional(),
    price_amount_minor: z.number(),
    currency_code: z.string(),
    interval_unit: z.enum(SubscriptionInterval),
    interval_count: z.number(),
    feature_keys: z.array(z.string()),
  }),
  /** Effective feature flags of the brand, keyed by feature key. */
  features: z.record(z.string(), z.boolean()),
  starts_at: z.string().nullable().optional(),
  ends_at: z.string().nullable().optional(),
  past_due_at: z.string().nullable().optional(),
  grace_ends_at: z.string().nullable().optional(),
  cancelled_at: z.string().nullable().optional(),
});

export const subscriptionListSchema = z.array(subscriptionSchema);
