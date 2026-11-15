import { DASHBOARD_API } from "@/config/routes.constant";
import { platformAnalyticsSchema } from "@/schemas/platform-analytics.zod";
import { apiRequest } from "@/services/api/core/client";
import type { EarningsRange } from "@/types/earnings/earnings-range.type";
import type { PlatformAnalytics } from "@/types/platform/platform-analytics.type";

export async function fetchPlatformAnalytics(range: EarningsRange): Promise<PlatformAnalytics> {
  const params = new URLSearchParams({ from: range.from, to: range.to });
  return apiRequest(`${DASHBOARD_API}/admin/analytics/overview?${params.toString()}`, { schema: platformAnalyticsSchema });
}
