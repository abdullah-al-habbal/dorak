import type { BookingStatus } from '../types/booking-status';

/** Dashboard booking response contract. Snake case stays here. */
export interface BookingWire {
  readonly at_home_location: unknown;
  readonly barber: { readonly name: { readonly en: string } } | null;
  readonly chair: { readonly label: string | null } | null;
  readonly created_at: string;
  readonly ends_at: string | null;
  readonly id: string;
  readonly payment_method: string | null;
  readonly payment_status: string | null;
  readonly services: readonly { readonly name: { readonly en: string } }[];
  readonly status: BookingStatus;
  readonly time_slot: string;
}
