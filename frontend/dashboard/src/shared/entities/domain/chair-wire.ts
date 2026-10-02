import type { Chair } from './types/chair';
import type { ChairFormInput } from './wire/chair-form-input';
import type { ChairPayloadWire } from './wire/chair-payload-wire';
import type { ChairWire } from './wire/chair-wire';

export type { ChairFormInput } from './wire/chair-form-input';
export type { ChairPayloadWire } from './wire/chair-payload-wire';
export type { ChairWire } from './wire/chair-wire';

/** Backend `ChairResource` translation. Snake case stays in the `wire/` DTOs. */
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
