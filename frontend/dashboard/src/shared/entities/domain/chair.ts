/** Dashboard chair domain record. Wire names stay in `chair-wire.ts`. */
export type ChairFloorZone = 'men' | 'shared' | 'women';
export type ChairStatus = 'available' | 'maintenance' | 'occupied';

export interface ChairUiMetadata {
  readonly height: number;
  readonly positionX: number;
  readonly positionY: number;
  readonly rotation: number | null;
  readonly width: number;
}

export interface Chair {
  readonly barberId: string | null;
  readonly branchId: string;
  readonly floorZone: ChairFloorZone;
  readonly id: string;
  readonly label: string | null;
  readonly status: ChairStatus;
  readonly uiMetadata: ChairUiMetadata;
}
