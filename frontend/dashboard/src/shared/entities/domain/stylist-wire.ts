import type { LocalizedStylistName, Stylist, StylistStatus } from './stylist';

/** Backend `BarberResource` contract. Snake case stays in this adapter. */
export interface StylistWire {
  readonly compatibility_score: number | null;
  readonly created_at: string | null;
  readonly distance: number | null;
  readonly email: string;
  readonly has_login: boolean;
  readonly id: string;
  readonly is_freelancer: boolean;
  readonly latitude: number | string | null;
  readonly longitude: number | string | null;
  readonly name: LocalizedStylistName;
  readonly phone: string | null;
  readonly rank: number | null;
  readonly status: StylistStatus;
  readonly travel_radius: number | string | null;
}

export type StylistPayloadWire = {
  readonly chair_id?: string;
  readonly email: string;
  readonly name: LocalizedStylistName;
  readonly password?: string;
  readonly phone: string | null;
  readonly status?: StylistStatus;
};

interface StylistFormInput {
  readonly chairId: string | null | undefined;
  readonly email: string;
  readonly name: LocalizedStylistName;
  readonly password: string | undefined;
  readonly phone: string | null | undefined;
  readonly status: StylistStatus | undefined;
}

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
