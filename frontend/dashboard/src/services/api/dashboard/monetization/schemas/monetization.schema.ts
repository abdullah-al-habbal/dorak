import { z } from "zod";
import {
  COMMISSION_SCOPES,
  COMMISSION_TYPES,
  INTERVAL_UNITS,
  MAX_PERCENT,
  PAYMENT_GATEWAY_DRIVERS,
  PAYOUT_STATUSES,
  SUBSCRIPTION_STATUSES,
} from "@/services/api/dashboard/monetization/monetization.constant";

const localized = z.object({ en: z.string(), ar: z.string() });
const currency = z.object({ id: z.string(), code: z.string() });

export const PlanSchema = z.object({
  id: z.string(),
  name: localized,
  description: localized,
  priceMinor: z.number(),
  currency: currency.nullable(),
  intervalUnit: z.enum(INTERVAL_UNITS),
  intervalCount: z.number(),
  isActive: z.boolean(),
  featureKeys: z.array(z.string()),
});

export const SubscriptionSchema = z.object({
  id: z.string(),
  status: z.enum(SUBSCRIPTION_STATUSES),
  brandId: z.string(),
  brandName: z.string(),
  planName: z.string(),
  endsAt: z.string().nullable(),
});

export const GatewaySchema = z.object({
  id: z.string(),
  code: z.string(),
  name: localized,
  driver: z.enum(PAYMENT_GATEWAY_DRIVERS),
  isActive: z.boolean(),
  isDefault: z.boolean(),
  configKeys: z.array(z.string()),
});

export const CommissionRuleSchema = z.object({
  id: z.string(),
  scope: z.enum(COMMISSION_SCOPES),
  scopeId: z.string().nullable(),
  type: z.enum(COMMISSION_TYPES),
  valueBps: z.number().nullable(),
  valueAmountMinor: z.number().nullable(),
  currency: currency.nullable(),
  isActive: z.boolean(),
});

export const CommissionEntrySchema = z.object({
  id: z.string(),
  bookingId: z.string(),
  baseMinor: z.number(),
  commissionMinor: z.number(),
  currencyCode: z.string(),
  settled: z.boolean(),
});

export const PayoutSchema = z.object({
  id: z.string(),
  status: z.enum(PAYOUT_STATUSES),
  brandName: z.string(),
  totalMinor: z.number(),
  currencyCode: z.string(),
  externalReference: z.string().nullable(),
});

const moneyTotal = z.object({ currency: z.string(), totalMinor: z.number() });
export const AnalyticsSchema = z.object({
  subscriptionsByPlan: z.array(
    z.object({ planId: z.string(), subscriptions: z.number() }),
  ),
  recurringRevenue: z.array(moneyTotal),
  commissionPending: z.array(moneyTotal),
  commissionSettled: z.array(moneyTotal),
  payouts: z.array(
    z.object({
      status: z.string(),
      currency: z.string(),
      payouts: z.number(),
      totalMinor: z.number(),
    }),
  ),
  completedBookings: z.number(),
});

const requiredText = z.string().trim().min(1).max(255);
const amount = z.coerce.number().min(0);

export const planFormSchema = z.object({
  nameEn: requiredText,
  nameAr: requiredText,
  descriptionEn: z.string().max(2000),
  descriptionAr: z.string().max(2000),
  price: amount,
  currencyCode: z.string().min(1),
  intervalUnit: z.enum(INTERVAL_UNITS),
  intervalCount: z.coerce.number().int().min(1).max(120),
  isActive: z.boolean(),
  featureKeys: z.preprocess(
    (value) =>
      Array.isArray(value)
        ? value
        : typeof value === "string" && value !== ""
          ? [value]
          : [],
    z.array(z.string()),
  ),
});

export const assignSubscriptionFormSchema = z.object({
  brandId: z.string().min(1),
  planId: z.string().min(1),
});

export const gatewayFormSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9_]+$/),
  nameEn: requiredText,
  nameAr: requiredText,
  driver: z.enum(PAYMENT_GATEWAY_DRIVERS),
  isActive: z.boolean(),
  isDefault: z.boolean(),
  /** One `key=value` per line; empty keeps the stored config. */
  config: z.string().max(5000),
});

export const commissionRuleFormSchema = z
  .object({
    scope: z.enum(COMMISSION_SCOPES),
    scopeId: z.string(),
    type: z.enum(COMMISSION_TYPES),
    value: z.coerce.number().positive(),
    currencyCode: z.string(),
    isActive: z.boolean(),
  })
  .refine((form) => form.scope === "global" || form.scopeId !== "", {
    path: ["scopeId"],
  })
  .refine((form) => form.type === "percent" || form.currencyCode !== "", {
    path: ["currencyCode"],
  })
  .refine((form) => form.type !== "percent" || form.value <= MAX_PERCENT, {
    path: ["value"],
  });
