"use client";

import { getDashboardList } from "@/services/api/dashboard/shared/dashboard.query";
import type { IDashboardListParams } from "@/services/api/dashboard/shared/types/idashboard-list-params.types";
import { useQuery } from "@tanstack/react-query";

interface UseDashboardListOptionsParams extends IDashboardListParams {
  /** Distinguishes query keys for the same resource fetched by different callers. */
  keySuffix: string;
}

export function useDashboardListOptions<TItem>(
  resource: string,
  mapItem: (wire: unknown) => TItem,
  { keySuffix, ...listParams }: UseDashboardListOptionsParams,
) {
  return useQuery({
    queryKey: ["dashboard", resource, keySuffix],
    queryFn: async () =>
      (await getDashboardList<unknown>(resource, listParams)).items.map(
        mapItem,
      ),
  });
}
