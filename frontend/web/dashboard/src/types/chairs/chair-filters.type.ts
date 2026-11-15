import type { ChairStatus } from "@/enums/chair-status.enum";
import type { FloorZone } from "@/enums/floor-zone.enum";

export interface ChairFilters {
  search?: string;
  branchId?: string;
  status?: ChairStatus;
  floorZone?: FloorZone;
  page: number;
}
