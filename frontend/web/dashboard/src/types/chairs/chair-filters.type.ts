import type { ChairStatus } from "@/enums/venue/chair-status.enum";
import type { FloorZone } from "@/enums/people/floor-zone.enum";

export interface ChairFilters {
  search?: string;
  branchId?: string;
  status?: ChairStatus;
  floorZone?: FloorZone;
  page: number;
}
