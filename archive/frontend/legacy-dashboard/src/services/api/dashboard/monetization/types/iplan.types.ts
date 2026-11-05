import type { z } from "zod";
import type { PlanSchema } from "@/services/api/dashboard/monetization/schemas/monetization.schema";

export type IPlan = z.infer<typeof PlanSchema>;
