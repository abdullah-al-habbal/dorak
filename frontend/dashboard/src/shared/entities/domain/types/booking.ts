import type { BookingStatus } from './booking-status';

export interface Booking {
  readonly barber: { readonly name: { readonly en: string } } | null;
  readonly chair: { readonly label: string | null } | null;
  readonly endsAt: string | null;
  readonly id: string;
  readonly services: readonly { readonly name: { readonly en: string } }[];
  readonly status: BookingStatus;
  readonly timeSlot: string;
}
