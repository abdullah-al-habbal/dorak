import { z } from "zod";

import { CommissionScope, CommissionType } from "@/enums/commission.enum";

const currencyRefSchema = z.object({ id: z.string().optional(), code: z.string() }).nullable().optional();

/** `GET /admin/commission-rules` (`CommissionRuleResource`). */
export const commissionRuleSchema = z.object({
  id: z.string(),
  scope: z.enum(CommissionScope),
  scope_id: z.string().nullable(),
  type: z.enum(CommissionType),
  value_bps: z.number().int().nullable(),
  value_amount_minor: z.number().int().nullable(),
  currency: currencyRefSchema,
  is_active: z.boolean(),
  notes: z.string().nullable().optional(),
  created_at: z.string(),
});

export const commissionRuleListSchema = z.array(commissionRuleSchema);

/** `GET /admin/commission-entries` (`CommissionEntryResource`). */
export const commissionEntrySchema = z.object({
  id: z.string(),
  booking_id: z.string().nullable().optional(),
  brand_id: z.string().nullable().optional(),
  branch_id: z.string().nullable().optional(),
  base_amount_minor: z.number().int(),
  commission_amount_minor: z.number().int(),
  currency: currencyRefSchema,
  payout_id: z.string().nullable().optional(),
  created_at: z.string(),
});

export const commissionEntryListSchema = z.array(commissionEntrySchema);
