"use client";

import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { analyticsKeys } from "@/lib/query-keys/platform/analytics-keys";
import { fetchPlatformAnalytics } from "@/services/api/query/platform-analytics.query";
import type { EarningsRange } from "@/types/earnings/earnings-range.type";
import type { PlatformAnalytics } from "@/types/platform/platform-analytics.type";

export function usePlatformAnalytics(range: EarningsRange): UseQueryResult<PlatformAnalytics> {
  return useQuery({ queryKey: analyticsKeys.range(range), queryFn: () => fetchPlatformAnalytics(range) });
}
