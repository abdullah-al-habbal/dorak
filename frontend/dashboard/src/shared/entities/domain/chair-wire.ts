import type { Chair, ChairFloorZone, ChairStatus, ChairUiMetadata } from './chair';

/** Backend `ChairResource` contract. Snake case exists only in this adapter. */
export interface ChairWire {
  readonly availability: ChairStatus;
  readonly barber: { readonly id: string } | null;
  readonly branch_id: string;
  readonly created_at: string;
  readonly floor_zone: ChairFloorZone;
  readonly id: string;
  readonly label: string | null;
  readonly status: ChairStatus;
  readonly ui_metadata: {
    readonly height: number;
    readonly position_x: number;
    readonly position_y: number;
    readonly rotation?: number | null;
    readonly width: number;
  };
}

export type ChairPayloadWire = {
  readonly barber_id: string | null;
  readonly branch_id: string;
  readonly floor_zone: ChairFloorZone;
  readonly label: string;
  readonly status: ChairStatus;
  readonly ui_metadata: {
    readonly height: number;
    readonly position_x: number;
    readonly position_y: number;
    readonly rotation?: number;
    readonly width: number;
  };
};

interface ChairFormInput {
  readonly barberId: string | null | undefined;
  readonly branchId: string;
  readonly floorZone: ChairFloorZone;
  readonly label: string;
  readonly status: ChairStatus;
  readonly uiMetadata: Omit<ChairUiMetadata, 'rotation'> & {
    readonly rotation: number | null | undefined;
  };
}

export function mapChairFromWire(wire: ChairWire): Chair {
  return {
    barberId: wire.barber?.id ?? null,
    branchId: wire.branch_id,
    floorZone: wire.floor_zone,
    id: wire.id,
    label: wire.label,
    status: wire.availability,
    uiMetadata: {
      height: wire.ui_metadata.height,
      positionX: wire.ui_metadata.position_x,
      positionY: wire.ui_metadata.position_y,
      rotation: wire.ui_metadata.rotation ?? null,
      width: wire.ui_metadata.width,
    },
  };
}

export function mapChairInputToWire(input: ChairFormInput): ChairPayloadWire {
  return {
    barber_id: input.barberId ?? null,
    branch_id: input.branchId,
    floor_zone: input.floorZone,
    label: input.label,
    status: input.status,
    ui_metadata: {
      height: input.uiMetadata.height,
      position_x: input.uiMetadata.positionX,
      position_y: input.uiMetadata.positionY,
      ...(input.uiMetadata.rotation == null ? {} : { rotation: input.uiMetadata.rotation }),
      width: input.uiMetadata.width,
    },
  };
}
