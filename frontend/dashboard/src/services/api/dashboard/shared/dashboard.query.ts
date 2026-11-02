import { api } from "@/services/api/core/client";
import type { DashboardEntityId } from "@/services/api/dashboard/shared/types/dashboard-entity-id.types";
import { DashboardEndpoints } from "@/services/api/dashboard/endpoints/dashboard.endpoints";
import type { IDashboardListParams } from "@/services/api/dashboard/shared/types/idashboard-list-params.types";
import type { IDashboardPage } from "@/services/api/dashboard/shared/types/idashboard-page.types";
import type { IDashboardOverview } from "@/services/api/dashboard/shared/types/idashboard-overview.types";
import { mapDashboardOverview } from "@/services/api/dashboard/shared/dashboard-mapper.util";

function queryString(
  params: IDashboardListParams = {},
  statusKey = "status",
): string {
  const query = new URLSearchParams();
  const values: Array<[string, string | number | undefined]> = [
    ["page", params.page],
    ["per_page", params.perPage],
    ["search", params.search],
    [statusKey, params.status],
    ["date_from", params.dateFrom],
    ["date_to", params.dateTo],
    ["chair_id", params.chairId],
    ["stylist_id", params.stylistId],
  ];
  values.forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  return query.size === 0 ? "" : `?${query.toString()}`;
}

export function getDashboardList<TItem>(
  resource: string,
  params?: IDashboardListParams,
) {
  return api.get<IDashboardPage<TItem>>(
    `${DashboardEndpoints.resource(resource)}${queryString(params, resource === "bookings" ? "booking_status" : "status")}`,
  );
}

export function getDashboardEntity<TItem>(
  resource: string,
  id: DashboardEntityId,
) {
  return api.get<TItem>(DashboardEndpoints.resourceById(resource, id));
}

export async function getDashboardOverview(): Promise<IDashboardOverview> {
  return mapDashboardOverview(
    await api.get<unknown>(DashboardEndpoints.overview),
  );
}
