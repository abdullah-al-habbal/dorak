import type { ChairStatus } from "@/enums/venue/chair-status.enum";
import type { FloorZone } from "@/enums/people/floor-zone.enum";

export interface ChairLayoutPayload {
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  rotation: number | null;
  shape?: string;
}

export interface ChairPayload {
  branch_id: string;
  label: string;
  floor_zone: FloorZone;
  status: ChairStatus;
  layout_settings: ChairLayoutPayload;
  /** Cancels future bookings when moving a chair to maintenance. */
  force?: boolean;
}
