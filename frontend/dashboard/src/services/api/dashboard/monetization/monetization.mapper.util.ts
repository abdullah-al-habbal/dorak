import {
  AnalyticsSchema,
  CommissionEntrySchema,
  CommissionRuleSchema,
  GatewaySchema,
  PayoutSchema,
  PlanSchema,
  SubscriptionSchema,
} from "@/services/api/dashboard/monetization/schemas/monetization.schema";
import {
  parseConfigLines,
  percentToBasisPoints,
  toMinorUnits,
} from "@/services/api/dashboard/monetization/monetization.util";
import type { IAnalytics } from "@/services/api/dashboard/monetization/types/ianalytics.types";
import type { ICommissionEntry } from "@/services/api/dashboard/monetization/types/icommission-entry.types";
import type { ICommissionRule } from "@/services/api/dashboard/monetization/types/icommission-rule.types";
import type { IAssignSubscriptionForm } from "@/services/api/dashboard/monetization/types/iassign-subscription-form.types";
import type { ICommissionRuleForm } from "@/services/api/dashboard/monetization/types/icommission-rule-form.types";
import type { IGatewayForm } from "@/services/api/dashboard/monetization/types/igateway-form.types";
import type { IGateway } from "@/services/api/dashboard/monetization/types/igateway.types";
import type { IPayout } from "@/services/api/dashboard/monetization/types/ipayout.types";
import type { IPlan } from "@/services/api/dashboard/monetization/types/iplan.types";
import type { IPlanForm } from "@/services/api/dashboard/monetization/types/iplan-form.types";
import type { ISubscription } from "@/services/api/dashboard/monetization/types/isubscription.types";
import { isRecord } from "@/utils/guards.util";

type Wire = Record<string, unknown>;

function record(value: unknown): Wire {
  return isRecord(value) ? value : {};
}
function list(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
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
function localized(value: unknown) {
  const item = record(value);
  return { en: text(item.en), ar: text(item.ar) };
}
function currency(value: unknown) {
  const item = record(value);
  return typeof item.id === "string"
    ? { id: item.id, code: text(item.code) }
    : null;
}
function displayName(value: unknown): string {
  const name = localized(value);
  return name.en || name.ar;
}
function totals(value: unknown) {
  return list(value).map((entry) => {
    const item = record(entry);
    return { currency: text(item.currency), totalMinor: num(item.total_minor) };
  });
}

export function mapPlan(wire: unknown): IPlan {
  const item = record(wire);
  return PlanSchema.parse({
    id: text(item.id),
    name: localized(item.name),
    description: localized(item.description),
    priceMinor: num(item.price_minor),
    currency: currency(item.currency),
    intervalUnit: text(item.interval_unit),
    intervalCount: num(item.interval_count),
    isActive: item.is_active === true,
    featureKeys: list(item.feature_keys).filter(
      (key): key is string => typeof key === "string",
    ),
  });
}

export function mapSubscription(wire: unknown): ISubscription {
  const item = record(wire);
  return SubscriptionSchema.parse({
    id: text(item.id),
    status: text(item.status),
    brandId: text(record(item.brand).id),
    brandName: displayName(record(item.brand).name),
    planName: displayName(record(item.plan).name),
    endsAt: nullableText(item.ends_at),
  });
}

export function mapGateway(wire: unknown): IGateway {
  const item = record(wire);
  return GatewaySchema.parse({
    id: text(item.id),
    code: text(item.code),
    name: localized(item.name),
    driver: text(item.driver),
    isActive: item.is_active === true,
    isDefault: item.is_default === true,
    configKeys: list(item.config_keys).filter(
      (key): key is string => typeof key === "string",
    ),
  });
}

export function mapCommissionRule(wire: unknown): ICommissionRule {
  const item = record(wire);
  return CommissionRuleSchema.parse({
    id: text(item.id),
    scope: text(item.scope),
    scopeId: nullableText(item.scope_id),
    type: text(item.type),
    value: num(item.value),
    currency: currency(item.currency),
    isActive: item.is_active === true,
  });
}

export function mapCommissionEntry(wire: unknown): ICommissionEntry {
  const item = record(wire);
  return CommissionEntrySchema.parse({
    id: text(item.id),
    bookingId: text(item.booking_id),
    baseMinor: num(item.base_minor),
    commissionMinor: num(item.commission_minor),
    currencyCode: text(record(item.currency).code),
    settled: typeof item.payout_id === "string",
  });
}

export function mapPayout(wire: unknown): IPayout {
  const item = record(wire);
  return PayoutSchema.parse({
    id: text(item.id),
    status: text(item.status),
    brandName: displayName(record(item.brand).name),
    totalMinor: num(item.total_minor),
    currencyCode: text(record(item.currency).code),
    reference: nullableText(item.reference),
  });
}

export function mapAnalytics(wire: unknown): IAnalytics {
  const item = record(wire);
  const subscriptions = record(item.subscriptions);
  const commission = record(item.commission);
  return AnalyticsSchema.parse({
    subscriptionsByPlan: list(subscriptions.by_plan).map((entry) => ({
      planId: text(record(entry).plan_id),
      subscriptions: num(record(entry).subscriptions),
    })),
    recurringRevenue: totals(subscriptions.recurring_revenue),
    commissionPending: totals(commission.pending),
    commissionSettled: totals(commission.settled),
    payouts: list(item.payouts).map((entry) => ({
      status: text(record(entry).status),
      currency: text(record(entry).currency),
      payouts: num(record(entry).payouts),
      totalMinor: num(record(entry).total_minor),
    })),
    completedBookings: num(item.completed_bookings),
  });
}

export function planPayload(form: IPlanForm) {
  return {
    name: { en: form.nameEn, ar: form.nameAr },
    description: {
      en: form.descriptionEn === "" ? null : form.descriptionEn,
      ar: form.descriptionAr === "" ? null : form.descriptionAr,
    },
    price_minor: toMinorUnits(form.price),
    currency_id: form.currencyId,
    interval_unit: form.intervalUnit,
    interval_count: form.intervalCount,
    is_active: form.isActive,
    feature_keys: form.featureKeys,
  };
}

export function gatewayPayload(form: IGatewayForm) {
  const config = parseConfigLines(form.config);
  return {
    code: form.code,
    name: { en: form.nameEn, ar: form.nameAr },
    driver: form.driver,
    is_active: form.isActive,
    is_default: form.isDefault,
    // Omitted when empty so the stored (encrypted) config is kept.
    ...(Object.keys(config).length > 0 ? { config } : {}),
  };
}

export function commissionRulePayload(form: ICommissionRuleForm) {
  return {
    scope: form.scope,
    scope_id: form.scope === "global" ? null : form.scopeId,
    type: form.type,
    value:
      form.type === "percent"
        ? percentToBasisPoints(form.value)
        : toMinorUnits(form.value),
    currency_id: form.type === "flat" ? form.currencyId : null,
    is_active: form.isActive,
  };
}

export const assignPayload = (form: IAssignSubscriptionForm) => ({
  brand_id: form.brandId,
  plan_id: form.planId,
});

export const gatewayActivePayload = (isActive: boolean) => ({
  is_active: isActive,
});
