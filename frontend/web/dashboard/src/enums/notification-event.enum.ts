/** Mirrors Modules\Core\Enums\PlatformEventEnum; the dashboard renders its own text from the event key. */
export enum NotificationEvent {
  BrandSubmitted = "brand_submitted",
  BarberAwaitingApproval = "barber_awaiting_approval",
  ReviewDisputed = "review_disputed",
  BrandApproved = "brand_approved",
  BrandRejected = "brand_rejected",
  BrandSuspended = "brand_suspended",
  BrandReactivated = "brand_reactivated",
  BarberApproved = "barber_approved",
  BarberRejected = "barber_rejected",
}
