import { z } from "zod";
import { EARNINGS_SCOPES } from "@/services/api/dashboard/earnings/earnings.constant";

export const EarningsTotalSchema = z.object({
  currencyCode: z.string(),
  grossMinor: z.number(),
  /** Platform commission; null for a stylist, who has no platform commission. */
  commissionMinor: z.number().nullable(),
  /** Null when a stylist has no active percent affiliation for every booking. */
  netMinor: z.number().nullable(),
  completedBookingsCount: z.number(),
});

export const EarningsSchema = z.object({
  scope: z.enum(EARNINGS_SCOPES),
  totals: z.array(EarningsTotalSchema),
});
