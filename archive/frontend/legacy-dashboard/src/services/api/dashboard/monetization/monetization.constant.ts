export const INTERVAL_UNITS = ["day", "week", "month", "year"] as const;
export const DEFAULT_INTERVAL_UNIT =
  "month" satisfies (typeof INTERVAL_UNITS)[number];
/** Mirrors `Modules\Payment\Enums\PaymentGatewayDriver`. */
export const PAYMENT_GATEWAY_DRIVERS = ["offline"] as const;
export const DEFAULT_PAYMENT_GATEWAY_DRIVER =
  "offline" satisfies (typeof PAYMENT_GATEWAY_DRIVERS)[number];
export const COMMISSION_SCOPES = ["global", "brand", "branch"] as const;
export const COMMISSION_TYPES = ["percent", "flat"] as const;
export const SUBSCRIPTION_STATUSES = [
  "pending",
  "active",
  "past_due",
  "cancelled",
] as const;
export const PAYOUT_STATUSES = [
  "draft",
  "approved",
  "paid",
  "cancelled",
] as const;

/** Basis points in 100%: percent rules are entered as a percentage and sent as bp. */
export const BASIS_POINTS_PER_PERCENT = 100;
/** Money is exchanged as integer minor units with two fraction digits. */
export const MINOR_UNITS_PER_MAJOR = 100;
export const MAX_PERCENT = 100;

/** Next statuses the UI offers; the backend state machine stays authoritative. */
export const SUBSCRIPTION_NEXT_STATUSES = {
  pending: ["active", "cancelled"],
  active: ["past_due", "cancelled"],
  ["past_due"]: ["active", "cancelled"],
  cancelled: [],
} as const;
export const PAYOUT_NEXT_ACTIONS = {
  draft: ["approve", "cancel"],
  approved: ["mark-paid", "cancel"],
  paid: [],
  cancelled: [],
} as const;

export const MONETIZATION_QUERY_KEYS = {
  plans: ["dashboard", "subscription-plans"],
  featureKeys: ["dashboard", "plan-feature-keys"],
  subscriptions: ["dashboard", "subscriptions"],
  gateways: ["dashboard", "payment-gateways"],
  rules: ["dashboard", "commission-rules"],
  entries: ["dashboard", "commission-entries"],
  payouts: ["dashboard", "payouts"],
  analytics: ["dashboard", "analytics"],
} as const;
