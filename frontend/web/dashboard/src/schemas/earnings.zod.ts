import { z } from "zod";

const CURRENCY_CODE = z.string().min(1);

/** One currency's totals. `commission_minor` exists for branch and brand scope, `net_minor` may be withheld for a stylist. */
export const earningsTotalSchema = z.object({
  currency_code: CURRENCY_CODE,
  gross_minor: z.number().int(),
  commission_minor: z.number().int().nullish(),
  net_minor: z.number().int().nullish(),
  completed_bookings_count: z.number().int(),
});

export const earningsSeriesPointSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  currency_code: CURRENCY_CODE,
  gross_minor: z.number().int(),
  completed_bookings_count: z.number().int(),
});

export const earningsSchema = z.object({
  scope: z.enum(["brand", "branch", "barber"]),
  totals: z.array(earningsTotalSchema),
  // Older backends sent only `scope` and `totals`.
  series: z.array(earningsSeriesPointSchema).default([]),
  previous_period: z.object({ from: z.string(), to: z.string() }).nullish(),
  previous_totals: z.array(earningsTotalSchema).nullish(),
});
