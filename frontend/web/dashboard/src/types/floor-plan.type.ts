import type { z } from "zod";

import type { floorCanvasSchema, floorDecorationSchema, floorPlanLayoutSchema, floorPlanSchema, floorZoneRectSchema } from "@/schemas/floor-plan.zod";

export type FloorPlan = z.infer<typeof floorPlanSchema>;
export type FloorPlanLayout = z.infer<typeof floorPlanLayoutSchema>;
export type FloorCanvas = z.infer<typeof floorCanvasSchema>;
export type FloorDecoration = z.infer<typeof floorDecorationSchema>;
export type FloorZoneRect = z.infer<typeof floorZoneRectSchema>;
