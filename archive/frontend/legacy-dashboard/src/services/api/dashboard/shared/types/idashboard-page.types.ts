import { z } from "zod";
import type { DashboardPageSchema } from "@/services/api/dashboard/shared/schemas/dashboard-common.schema";

export type IDashboardPage<TItem> = z.infer<
  ReturnType<typeof DashboardPageSchema<z.ZodType<TItem>>>
>;
