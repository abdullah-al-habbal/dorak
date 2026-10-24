import { z } from "zod";
import { DashboardListParamsSchema } from "@/services/api/dashboard/schema/dashboard-inputs.schema";

export type IDashboardListParams = z.infer<typeof DashboardListParamsSchema>;
