import type { Branch, BranchStatus, LocalizedBranchName } from './branch';

/**
 * Backend `BranchResource` contract. Snake case may exist only in this wire
 * translation module.
 */
export interface BranchWire {
  readonly brand_id: string;
  readonly compatibility_score: number | null;
  readonly created_at: string | null;
  readonly distance: number | null;
  readonly email: string;
  readonly id: string;
  readonly latitude: number | string | null;
  readonly longitude: number | string | null;
  readonly name: LocalizedBranchName;
  readonly rank: number | null;
  readonly status: BranchStatus;
}

export type BranchPayloadWire = {
  readonly brand_id: string;
  readonly email: string;
  readonly latitude: number | null;
  readonly longitude: number | null;
  readonly name: LocalizedBranchName;
  readonly password?: string;
  readonly status?: BranchStatus;
};

interface BranchFormInput {
  readonly brandId: string;
  readonly email: string;
  readonly latitude: number | undefined;
  readonly longitude: number | undefined;
  readonly name: LocalizedBranchName;
  readonly password: string | undefined;
  readonly status: BranchStatus | undefined;
}

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
