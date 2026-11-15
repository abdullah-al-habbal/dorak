import { z } from "zod";

const moneyTotalSchema = z.object({ currency: z.string(), total_amount_minor: z.number() });

export const platformAnalyticsSchema = z.object({
  period: z.object({ from: z.string().nullable(), to: z.string().nullable() }),
  platform: z.object({ brands: z.number(), branches: z.number(), barbers: z.number(), clients: z.number() }),
  subscriptions: z.object({
    by_plan: z.array(z.object({ plan_id: z.string(), plan_name: z.string(), subscriptions: z.number() })),
    recurring_revenue: z.array(moneyTotalSchema),
  }),
  commission: z.object({ pending: z.array(moneyTotalSchema), settled: z.array(moneyTotalSchema) }),
  payouts: z.array(z.object({ status: z.string(), currency: z.string(), payouts: z.number(), total_amount_minor: z.number() })),
  completed_bookings: z.number(),
  bookings_by_status: z.array(z.object({ status: z.string(), count: z.number() })),
  completed_bookings_series: z.array(z.object({ date: z.string(), count: z.number() })),
});
