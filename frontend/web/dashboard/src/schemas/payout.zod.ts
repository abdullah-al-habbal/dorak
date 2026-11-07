import { z } from "zod";

import { PayoutDirection } from "@/enums/payout-direction.enum";
import { PayoutStatus } from "@/enums/payout-status.enum";
import { localizedTextSchema } from "@/schemas/localized-text.zod";

export const payoutSchema = z.object({
  id: z.string(),
  status: z.enum(PayoutStatus),
  direction_type: z.enum(PayoutDirection),
  total_amount_minor: z.number(),
  currency_code: z.string(),
  brand: z.object({ id: z.string(), name: localizedTextSchema }).nullable().optional(),
  period_started_at: z.string().nullable().optional(),
  period_ended_at: z.string().nullable().optional(),
  approved_at: z.string().nullable().optional(),
  paid_at: z.string().nullable().optional(),
  external_reference: z.string().nullable().optional(),
  created_at: z.string(),
});

export const payoutListSchema = z.array(payoutSchema);
