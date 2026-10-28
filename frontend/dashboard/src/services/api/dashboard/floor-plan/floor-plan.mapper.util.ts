import {
  FLOOR_DECORATION_TYPES,
  FLOOR_PLAN_CANVAS_UNITS,
  FLOOR_PLAN_PRESETS,
  FLOOR_ZONES,
} from "@/services/api/dashboard/floor-plan/floor-plan.constant";
import type { IFloorPlan } from "@/services/api/dashboard/floor-plan/types/ifloor-plan.types";
import type { IFloorPlanLayout } from "@/services/api/dashboard/floor-plan/types/ifloor-plan-layout.types";
import { isRecord } from "@/utils/guards.util";

type Wire = Record<string, unknown>;

function record(value: unknown): Wire {
  return isRecord(value) ? value : {};
}
function list(value: unknown): Wire[] {
  return Array.isArray(value) ? value.map(record) : [];
}
function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}
function numeric(value: unknown, fallback = 0): number {
  const parsed = typeof value === "string" ? Number(value) : value;
  return typeof parsed === "number" && Number.isFinite(parsed)
    ? parsed
    : fallback;
}
function oneOf<T extends string>(
  options: readonly T[],
  value: unknown,
  fallback: T,
): T {
  return options.find((option) => option === value) ?? fallback;
}

function mapLayout(wire: Wire): IFloorPlanLayout {
  const canvas = record(wire.canvas);
  return {
    preset: oneOf(FLOOR_PLAN_PRESETS, wire.preset, "standard"),
    zones: list(wire.zones).map((zone) => ({
      zone: oneOf(FLOOR_ZONES, zone.zone, "shared"),
      x: numeric(zone.x),
      y: numeric(zone.y),
      width: numeric(zone.width, 1),
      height: numeric(zone.height, 1),
    })),
    canvas: {
      width: numeric(canvas.width, 1),
      height: numeric(canvas.height, 1),
      unit: oneOf(FLOOR_PLAN_CANVAS_UNITS, canvas.unit, "m"),
    },
    decorations: list(wire.decorations).map((item) => ({
      type: oneOf(FLOOR_DECORATION_TYPES, item.type, "plant"),
      x: numeric(item.x),
      y: numeric(item.y),
      width: numeric(item.width, 1),
      height: numeric(item.height, 1),
      label: typeof item.label === "string" ? item.label : null,
    })),
  };
}

export function mapFloorPlan(wire: unknown): IFloorPlan {
  const item = record(wire);
  return {
    branchId: text(item.branch_id),
    branchName: text(item.branch_name),
    layout: mapLayout(record(item.floor_plan)),
    chairs: list(item.chairs).map((chair) => ({
      id: text(chair.id),
      label: typeof chair.label === "string" ? chair.label : null,
      status: typeof chair.status === "string" ? chair.status : null,
      floorZone: typeof chair.floor_zone === "string" ? chair.floor_zone : null,
    })),
  };
}

/** Wire (snake_case-free) body for PATCH branches/{branch}/floor-plan. */
export function floorPlanPayload(layout: IFloorPlanLayout) {
  return {
    preset: layout.preset,
    zones: layout.preset === "unisex_zoned" ? layout.zones : [],
    canvas: layout.canvas,
    decorations: layout.decorations.map((item) => ({
      ...item,
      label: item.label === "" ? null : item.label,
    })),
  };
}
