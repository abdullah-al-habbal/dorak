import type { Booking } from './types/booking';
import type { WalkInBookingInput } from './types/walk-in-booking-input';
import type { BookingWire } from './wire/booking-wire';
import type { WalkInBookingPayloadWire } from './wire/walk-in-booking-payload-wire';

export type { BookingWire } from './wire/booking-wire';
export type { WalkInBookingPayloadWire } from './wire/walk-in-booking-payload-wire';

/** Dashboard booking response and request contract. Snake case stays in `wire/`. */
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
