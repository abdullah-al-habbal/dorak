import { z } from "zod";
import { DashboardOverviewSchema } from "@/services/api/dashboard/shared/schemas/dashboard-profile.schema";

export type IDashboardOverview = z.infer<typeof DashboardOverviewSchema>;
