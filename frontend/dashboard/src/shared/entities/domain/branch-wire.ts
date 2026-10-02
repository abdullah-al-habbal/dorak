import type { Branch } from './types/branch';
import type { BranchFormInput } from './wire/branch-form-input';
import type { BranchPayloadWire } from './wire/branch-payload-wire';
import type { BranchWire } from './wire/branch-wire';

export type { BranchFormInput } from './wire/branch-form-input';
export type { BranchPayloadWire } from './wire/branch-payload-wire';
export type { BranchWire } from './wire/branch-wire';

/**
 * Backend `BranchResource` translation. Snake case may exist only in the `wire/`
 * DTOs this module consumes.
 */
function mapCoordinate(value: number | string | null): number | null {
  return value === null ? null : Number(value);
}

export function mapBranchFromWire(wire: BranchWire): Branch {
  return {
    brandId: wire.brand_id,
    email: wire.email,
    id: wire.id,
    latitude: mapCoordinate(wire.latitude),
    longitude: mapCoordinate(wire.longitude),
    name: wire.name,
    status: wire.status,
  };
}

export function mapBranchInputToWire(input: BranchFormInput): BranchPayloadWire {
  return {
    brand_id: input.brandId,
    email: input.email,
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    name: input.name,
    ...(input.password === undefined ? {} : { password: input.password }),
    ...(input.status === undefined ? {} : { status: input.status }),
  };
}
