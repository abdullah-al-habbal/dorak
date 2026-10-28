import type { z } from "zod";
import type { planFormSchema } from "@/services/api/dashboard/monetization/schemas/monetization.schema";

export type IPlanForm = z.output<typeof planFormSchema>;
