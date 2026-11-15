import { DEFAULT_CHAIR_LAYOUT } from "@/config/venue/chair-layout.constant";
import { ChairStatus } from "@/enums/venue/chair-status.enum";
import { FloorZone } from "@/enums/people/floor-zone.enum";
import type { ChairLayoutPayload, ChairPayload } from "@/interfaces/chairs/chair-payload.interface";
import type { ChairFormValues } from "@/schemas/chairs/chair-form.zod";
import type { Chair } from "@/types/chairs/chair.type";

export function emptyChairForm(branchId: string): ChairFormValues {
  return { label: "", floor_zone: FloorZone.Shared, status: ChairStatus.Available, branch_id: branchId };
}

export function chairToForm(chair: Chair, fallbackBranchId: string): ChairFormValues {
  return {
    label: chair.label ?? "",
    floor_zone: chair.floor_zone ?? FloorZone.Shared,
    status: chair.configured_status ?? ChairStatus.Available,
    branch_id: chair.branch_id ?? fallbackBranchId,
  };
}

/** Keeps the saved floor-plan placement so a dashboard edit never moves a chair. */
export function layoutOf(chair?: Chair): ChairLayoutPayload {
  const saved = chair?.layout_settings;
  if (!saved) return DEFAULT_CHAIR_LAYOUT;
  return {
    position_x: saved.position_x,
    position_y: saved.position_y,
    width: saved.width,
    height: saved.height,
    rotation: saved.rotation ?? 0,
    shape: saved.shape ?? DEFAULT_CHAIR_LAYOUT.shape,
  };
}

export function formToChairPayload(values: ChairFormValues, chair?: Chair): ChairPayload {
  return {
    branch_id: values.branch_id,
    label: values.label.trim(),
    floor_zone: values.floor_zone,
    status: values.status,
    layout_settings: layoutOf(chair),
  };
}

/** A full payload for a status-only change; the update endpoint replaces the whole chair. */
export function statusChangePayload(chair: Chair, status: ChairStatus, force: boolean): ChairPayload {
  return {
    branch_id: chair.branch_id ?? "",
    label: chair.label ?? "",
    floor_zone: chair.floor_zone ?? FloorZone.Shared,
    status,
    layout_settings: layoutOf(chair),
    ...(force ? { force: true } : {}),
  };
}
