import { z } from "zod";
import {
  INTERVAL_UNITS,
  PAYOUT_STATUSES,
  SUBSCRIPTION_STATUSES,
} from "@/services/api/dashboard/monetization/monetization.constant";

export const OwnerSubscriptionSchema = z.object({
  id: z.string(),
  status: z.enum(SUBSCRIPTION_STATUSES),
  brandName: z.string(),
  planName: z.string(),
  priceMinor: z.number(),
  currencyCode: z.string(),
  intervalUnit: z.enum(INTERVAL_UNITS),
  intervalCount: z.number(),
  featureKeys: z.array(z.string()),
  endsAt: z.string().nullable(),
  graceEndsAt: z.string().nullable(),
});

export const OwnerPayoutSchema = z.object({
  id: z.string(),
  status: z.enum(PAYOUT_STATUSES),
  brandName: z.string(),
  totalMinor: z.number(),
  currencyCode: z.string(),
  direction: z.string(),
  paidAt: z.string().nullable(),
  externalReference: z.string().nullable(),
});
