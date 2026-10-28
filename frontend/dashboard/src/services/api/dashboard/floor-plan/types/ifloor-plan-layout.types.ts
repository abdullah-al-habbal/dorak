import type { z } from "zod";
import type { floorPlanFormSchema } from "@/services/api/dashboard/floor-plan/schemas/floor-plan.schema";

export type IFloorPlanLayout = z.output<typeof floorPlanFormSchema>;
