import type { z } from "zod";
import type { AnalyticsSchema } from "@/services/api/dashboard/monetization/schemas/monetization.schema";

export type IAnalytics = z.infer<typeof AnalyticsSchema>;
