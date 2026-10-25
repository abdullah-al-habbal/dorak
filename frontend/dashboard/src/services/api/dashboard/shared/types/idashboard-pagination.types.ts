import { z } from "zod";
import { DashboardPaginationSchema } from "@/services/api/dashboard/shared/schemas/dashboard-common.schema";

export type IDashboardPagination = z.infer<typeof DashboardPaginationSchema>;
