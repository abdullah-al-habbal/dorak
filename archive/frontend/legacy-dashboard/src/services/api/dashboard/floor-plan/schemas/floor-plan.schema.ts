import { z } from "zod";
import {
  FLOOR_DECORATION_TYPES,
  FLOOR_PLAN_CANVAS_UNITS,
  FLOOR_PLAN_MAX_CANVAS_SIZE,
  FLOOR_PLAN_MAX_DECORATIONS,
  FLOOR_PLAN_MAX_LABEL_LENGTH,
  FLOOR_PLAN_MAX_ZONES,
  FLOOR_PLAN_PERCENT_MAX,
  FLOOR_PLAN_PRESETS,
  FLOOR_ZONES,
} from "@/services/api/dashboard/floor-plan/floor-plan.constant";

const percent = z.coerce.number().min(0).max(FLOOR_PLAN_PERCENT_MAX);
const percentSize = z.coerce.number().gt(0).max(FLOOR_PLAN_PERCENT_MAX);

export const FloorPlanZoneSchema = z.object({
  zone: z.enum(FLOOR_ZONES),
  x: percent,
  y: percent,
  width: percentSize,
  height: percentSize,
});

export const FloorPlanCanvasSchema = z.object({
  width: z.coerce.number().gt(0).max(FLOOR_PLAN_MAX_CANVAS_SIZE),
  height: z.coerce.number().gt(0).max(FLOOR_PLAN_MAX_CANVAS_SIZE),
  unit: z.enum(FLOOR_PLAN_CANVAS_UNITS),
});

export const FloorPlanDecorationSchema = z.object({
  type: z.enum(FLOOR_DECORATION_TYPES),
  x: percent,
  y: percent,
  width: percentSize,
  height: percentSize,
  label: z.string().max(FLOOR_PLAN_MAX_LABEL_LENGTH).nullable(),
});

export const floorPlanFormSchema = z
  .object({
    preset: z.enum(FLOOR_PLAN_PRESETS),
    zones: z.array(FloorPlanZoneSchema).max(FLOOR_PLAN_MAX_ZONES),
    canvas: FloorPlanCanvasSchema,
    decorations: z
      .array(FloorPlanDecorationSchema)
      .max(FLOOR_PLAN_MAX_DECORATIONS),
  })
  .refine(
    (value) =>
      value.preset !== "unisex_zoned" ||
      (value.zones.some((zone) => zone.zone === "men") &&
        value.zones.some((zone) => zone.zone === "women")),
    { path: ["zones"], message: "unisexZonesRequired" },
  );

export const FloorPlanChairSchema = z.object({
  id: z.string(),
  label: z.string().nullable(),
  status: z.string().nullable(),
  floorZone: z.string().nullable(),
});

export const FloorPlanSchema = z.object({
  branchId: z.string(),
  branchName: z.string(),
  layout: floorPlanFormSchema,
  chairs: z.array(FloorPlanChairSchema),
});
