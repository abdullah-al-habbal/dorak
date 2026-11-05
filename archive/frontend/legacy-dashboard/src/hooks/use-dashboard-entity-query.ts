"use client";

import { getDashboardEntity } from "@/services/api/dashboard/shared/dashboard.query";
import { mapDashboardEntity } from "@/services/api/dashboard/shared/dashboard-entity.util";
import type { EditableDashboardResource } from "@/services/api/dashboard/shared/types/editable-dashboard-resource.types";
import { useQuery } from "@tanstack/react-query";

export function useDashboardEntityQuery(
  resource: EditableDashboardResource,
  id: string | undefined,
) {
  return useQuery({
    enabled: id !== undefined,
    queryKey: ["dashboard", resource, id],
    queryFn: async () =>
      mapDashboardEntity(
        resource,
        await getDashboardEntity<unknown>(resource, id ?? ""),
      ),
  });
}
