import type { OverlayKind } from "@/enums/overlay-kind.enum";
import type { Booking } from "@/types/bookings/booking.type";

export interface RateClientOverlayRequest {
  kind: OverlayKind.RateClient;
  booking: Booking;
}
