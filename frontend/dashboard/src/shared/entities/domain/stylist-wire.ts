import type { Stylist } from './types/stylist';
import type { StylistFormInput } from './wire/stylist-form-input';
import type { StylistPayloadWire } from './wire/stylist-payload-wire';
import type { StylistWire } from './wire/stylist-wire';

export type { StylistFormInput } from './wire/stylist-form-input';
export type { StylistPayloadWire } from './wire/stylist-payload-wire';
export type { StylistWire } from './wire/stylist-wire';

/** Backend `BarberResource` translation. Snake case stays in the `wire/` DTOs. */
export function mapStylistFromWire(wire: StylistWire): Stylist {
  return {
    email: wire.email,
    id: wire.id,
    name: wire.name,
    phone: wire.phone,
    status: wire.status,
  };
}

export function mapStylistInputToWire(input: StylistFormInput): StylistPayloadWire {
  return {
    email: input.email,
    name: input.name,
    phone: input.phone ?? null,
    ...(input.chairId == null ? {} : { chair_id: input.chairId }),
    ...(input.password === undefined ? {} : { password: input.password }),
    ...(input.status === undefined ? {} : { status: input.status }),
  };
}
