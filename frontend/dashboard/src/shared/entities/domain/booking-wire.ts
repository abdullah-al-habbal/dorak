import type { Booking, BookingStatus, WalkInBookingInput } from './booking';

/** Dashboard booking response and request contract. Snake case stays here. */
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

export type WalkInBookingPayloadWire = {
  readonly barber_id?: string;
  readonly branch_id: string;
  readonly chair_id: string;
  readonly customer_email: string;
  readonly customer_name: string;
  readonly customer_phone?: string;
  readonly service_ids: string[];
  readonly time_slot: string;
};

export function mapBookingFromWire(wire: BookingWire): Booking {
  return {
    barber: wire.barber,
    chair: wire.chair,
    endsAt: wire.ends_at,
    id: wire.id,
    services: wire.services,
    status: wire.status,
    timeSlot: wire.time_slot,
  };
}

export function mapBookingInputToWire(input: WalkInBookingInput): WalkInBookingPayloadWire {
  return {
    branch_id: input.branchId,
    chair_id: input.chairId,
    customer_email: input.customerEmail,
    customer_name: input.customerName,
    service_ids: input.serviceIds,
    time_slot: new Date(input.timeSlot).toISOString(),
    ...(input.barberId == null ? {} : { barber_id: input.barberId }),
    ...(input.customerPhone === undefined ? {} : { customer_phone: input.customerPhone }),
  };
}
