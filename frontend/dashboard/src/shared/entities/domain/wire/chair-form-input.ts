import type { ChairFloorZone } from '../types/chair-floor-zone';
import type { ChairStatus } from '../types/chair-status';
import type { ChairUiMetadata } from '../types/chair-ui-metadata';

export interface ChairFormInput {
  readonly barberId: string | null | undefined;
  readonly branchId: string;
  readonly floorZone: ChairFloorZone;
  readonly label: string;
  readonly status: ChairStatus;
  readonly uiMetadata: Omit<ChairUiMetadata, 'rotation'> & {
    readonly rotation: number | null | undefined;
  };
}
