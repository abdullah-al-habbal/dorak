import type { z } from "zod";

import type { platformAnalyticsSchema } from "@/schemas/platform/platform-analytics.zod";

export type PlatformAnalytics = z.infer<typeof platformAnalyticsSchema>;
