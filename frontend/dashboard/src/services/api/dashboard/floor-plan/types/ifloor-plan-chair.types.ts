import type { z } from "zod";
import type { FloorPlanChairSchema } from "@/services/api/dashboard/floor-plan/schemas/floor-plan.schema";

export type IFloorPlanChair = z.infer<typeof FloorPlanChairSchema>;
