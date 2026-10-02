import type { ChairFloorZone } from './chair-floor-zone';
import type { ChairStatus } from './chair-status';
import type { ChairUiMetadata } from './chair-ui-metadata';

/** Dashboard chair domain record. Wire names stay in `wire/chair-wire.ts`. */
export interface Chair {
  readonly barberId: string | null;
  readonly branchId: string;
  readonly floorZone: ChairFloorZone;
  readonly id: string;
  readonly label: string | null;
  readonly status: ChairStatus;
  readonly uiMetadata: ChairUiMetadata;
}
