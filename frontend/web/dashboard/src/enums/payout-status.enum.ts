/** Mirrors Modules\Payout\Enums\PayoutStatus. Owners never receive `draft`; it is kept so the contract stays whole. */
export enum PayoutStatus {
  Draft = "draft",
  Approved = "approved",
  Paid = "paid",
  Cancelled = "cancelled",
}
