import { z } from "zod";

import { FloorCanvasUnit } from "@/enums/floor-canvas-unit.enum";
import { FloorDecorationType } from "@/enums/floor-decoration-type.enum";
import { FloorPlanPreset } from "@/enums/floor-plan-preset.enum";
import { FloorZone } from "@/enums/floor-zone.enum";
import { chairSchema } from "@/schemas/chair.zod";

export const floorZoneRectSchema = z.object({
  zone: z.enum(FloorZone),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
});

export const floorDecorationSchema = z.object({
  type: z.enum(FloorDecorationType),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  label: z.string().nullable().optional(),
});

export const floorCanvasSchema = z.object({ width: z.number(), height: z.number(), unit: z.enum(FloorCanvasUnit) });

export const floorPlanLayoutSchema = z.object({
  preset: z.enum(FloorPlanPreset).nullable(),
  zones: z.array(floorZoneRectSchema).default([]),
  canvas: floorCanvasSchema,
  decorations: z.array(floorDecorationSchema).default([]),
});

/** `GET /branches/{id}/floor-plan`. */
export const floorPlanSchema = z.object({
  branch_id: z.string(),
  floor_plan: floorPlanLayoutSchema,
  chairs: z.array(chairSchema),
});
