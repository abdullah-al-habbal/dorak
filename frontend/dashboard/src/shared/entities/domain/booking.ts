export type BookingStatus =
  'canceled' | 'completed' | 'confirmed' | 'in_progress' | 'no_show' | 'pending';

export interface Booking {
  readonly barber: { readonly name: { readonly en: string } } | null;
  readonly chair: { readonly label: string | null } | null;
  readonly endsAt: string | null;
  readonly id: string;
  readonly services: readonly { readonly name: { readonly en: string } }[];
  readonly status: BookingStatus;
  readonly timeSlot: string;
}

export interface WalkInBookingInput {
  readonly barberId: string | null | undefined;
  readonly branchId: string;
  readonly chairId: string;
  readonly customerEmail: string;
  readonly customerName: string;
  readonly customerPhone: string | undefined;
  readonly serviceIds: string[];
  readonly timeSlot: string;
}
