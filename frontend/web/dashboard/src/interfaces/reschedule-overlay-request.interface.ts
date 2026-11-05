import type { OverlayKind } from "@/enums/overlay-kind.enum";
import type { Booking } from "@/types/booking.type";

export interface RescheduleOverlayRequest {
  kind: OverlayKind.Reschedule;
  booking: Booking;
}
