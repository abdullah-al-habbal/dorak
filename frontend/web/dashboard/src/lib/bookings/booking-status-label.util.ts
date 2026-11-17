import { BookingStatus } from "@/enums/booking/booking-status.enum";
import { isEnumValue } from "@/lib/core/parse/enum-value.util";
import type { Dictionary } from "@/types/core/shared/dictionary.type";


export function isBookingStatus(value: string): value is BookingStatus {
  return isEnumValue(BookingStatus, value);
}

/** The localised status name, or the raw value if the backend sends one this build does not know. */
export function statusLabel(status: string, dictionary: Dictionary): string {
  return isBookingStatus(status) ? dictionary.bookings.status[status] : status;
}

export function actorLabel(actor: string, dictionary: Dictionary): string {
  const labels: Record<string, string> = dictionary.bookings.history.actor;
  return labels[actor] ?? actor;
}
