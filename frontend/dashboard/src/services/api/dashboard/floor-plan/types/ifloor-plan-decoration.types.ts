import type { z } from "zod";
import type { FloorPlanDecorationSchema } from "@/services/api/dashboard/floor-plan/schemas/floor-plan.schema";

export type IFloorPlanDecoration = z.infer<typeof FloorPlanDecorationSchema>;
