import type { z } from "zod";
import type { FloorPlanSchema } from "@/services/api/dashboard/floor-plan/schemas/floor-plan.schema";

export type IFloorPlan = z.infer<typeof FloorPlanSchema>;
