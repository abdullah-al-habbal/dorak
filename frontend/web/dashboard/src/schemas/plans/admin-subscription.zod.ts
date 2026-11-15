import { z } from "zod";

import { SubscriptionStatus } from "@/enums/subscription-status.enum";
import { localizedTextSchema } from "@/schemas/core/localized-text.zod";

export const adminSubscriptionSchema = z.object({
  id: z.string(),
  status: z.enum(SubscriptionStatus),
  brand: z.object({ id: z.string(), name: localizedTextSchema }).nullable().optional(),
  plan: z.object({ id: z.string(), name: localizedTextSchema }).nullable().optional(),
  starts_at: z.string().nullable().optional(),
  ends_at: z.string().nullable().optional(),
  past_due_at: z.string().nullable().optional(),
  grace_ends_at: z.string().nullable().optional(),
  cancelled_at: z.string().nullable().optional(),
});

export const adminSubscriptionListSchema = z.array(adminSubscriptionSchema);
