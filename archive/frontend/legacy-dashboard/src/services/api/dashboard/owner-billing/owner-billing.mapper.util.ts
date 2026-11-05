import {
  OwnerPayoutSchema,
  OwnerSubscriptionSchema,
} from "@/services/api/dashboard/owner-billing/schemas/owner-billing.schema";
import type { IOwnerPayout } from "@/services/api/dashboard/owner-billing/types/iowner-payout.types";
import type { IOwnerSubscription } from "@/services/api/dashboard/owner-billing/types/iowner-subscription.types";
import { isRecord } from "@/utils/guards.util";

type Wire = Record<string, unknown>;

function record(value: unknown): Wire {
  return isRecord(value) ? value : {};
}
function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}
function nullableText(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}
function num(value: unknown): number {
  return typeof value === "number" ? value : 0;
}
function displayName(value: unknown): string {
  const name = record(value);
  return text(name.en) || text(name.ar);
}

export function mapOwnerSubscription(wire: unknown): IOwnerSubscription {
  const item = record(wire);
  const plan = record(item.plan);
  return OwnerSubscriptionSchema.parse({
    id: text(item.id),
    status: text(item.status),
    brandName: displayName(record(item.brand).name),
    planName: displayName(plan.name),
    priceMinor: num(plan.price_amount_minor),
    currencyCode: text(plan.currency_code),
    intervalUnit: text(plan.interval_unit),
    intervalCount: num(plan.interval_count),
    featureKeys: Array.isArray(plan.feature_keys)
      ? plan.feature_keys.filter(
          (key): key is string => typeof key === "string",
        )
      : [],
    endsAt: nullableText(item.ends_at),
    graceEndsAt: nullableText(item.grace_ends_at),
  });
}

export function mapOwnerPayout(wire: unknown): IOwnerPayout {
  const item = record(wire);
  return OwnerPayoutSchema.parse({
    id: text(item.id),
    status: text(item.status),
    brandName: displayName(record(item.brand).name),
    totalMinor: num(item.total_amount_minor),
    currencyCode: text(item.currency_code),
    direction: text(item.direction_type),
    paidAt: nullableText(item.paid_at),
    externalReference: nullableText(item.external_reference),
  });
}
