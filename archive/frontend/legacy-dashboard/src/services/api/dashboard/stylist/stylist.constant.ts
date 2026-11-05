/** Mirrors the backend `Modules\Barber\Enums\BarberStatusEnum` values. */
export const STYLIST_STATUSES = ["pending", "enabled", "disabled"] as const;

export const STYLIST_STATUS = {
  pending: "pending",
  enabled: "enabled",
  disabled: "disabled",
} as const;
