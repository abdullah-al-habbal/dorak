import type { z } from "zod";
import type {
  FloorPlanChairSchema,
  FloorPlanDecorationSchema,
  FloorPlanSchema,
  floorPlanFormSchema,
} from "@/services/api/dashboard/floor-plan/schemas/floor-plan.schema";

export type IFloorPlan = z.infer<typeof FloorPlanSchema>;
export type IFloorPlanChair = z.infer<typeof FloorPlanChairSchema>;
export type IFloorPlanDecoration = z.infer<typeof FloorPlanDecorationSchema>;
export type IFloorPlanLayoutInput = z.input<typeof floorPlanFormSchema>;
export type IFloorPlanLayout = z.output<typeof floorPlanFormSchema>;
