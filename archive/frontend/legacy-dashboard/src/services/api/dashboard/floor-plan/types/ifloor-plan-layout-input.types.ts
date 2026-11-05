import type { z } from "zod";
import type { floorPlanFormSchema } from "@/services/api/dashboard/floor-plan/schemas/floor-plan.schema";

export type IFloorPlanLayoutInput = z.input<typeof floorPlanFormSchema>;
