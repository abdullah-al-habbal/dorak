import type { ChairFloorZone } from '../types/chair-floor-zone';
import type { ChairStatus } from '../types/chair-status';

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
