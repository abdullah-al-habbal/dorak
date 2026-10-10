import type { ChairFloorZone } from '../types/chair-floor-zone';
import type { ChairStatus } from '../types/chair-status';

/** Backend `ChairResource` contract. Snake case exists only in this DTO. */
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
