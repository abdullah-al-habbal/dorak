import { apiRequest } from "@/services/api/client";
import type { DashboardEntityId } from "@/services/api/dashboard/dashboard-entity-id.types";
import type { IDashboardListParams } from "@/services/api/dashboard/idashboard-list-params.types";
import type { IDashboardPage } from "@/services/api/dashboard/idashboard-page.types";
import type { IDashboardOverview } from "@/services/api/dashboard/idashboard-overview.types";
import { mapDashboardOverview } from "@/services/api/dashboard/dashboard-mapper.util";

function queryString(params: IDashboardListParams = {}): string {
  const query = new URLSearchParams();
  const values: Array<[string, string | number | undefined]> = [
    ["page", params.page],
    ["per_page", params.perPage],
    ["search", params.search],
    ["status", params.status],
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

export function getDashboardList<TItem>(resource: string, params?: IDashboardListParams) {
  return apiRequest<IDashboardPage<TItem>>(`/api/dashboard/${resource}${queryString(params)}`, { auth: "session" });
}

export function getDashboardEntity<TItem>(resource: string, id: DashboardEntityId) {
  return apiRequest<TItem>(`/api/dashboard/${resource}/${encodeURIComponent(id)}`, { auth: "session" });
}

export async function getDashboardOverview(): Promise<IDashboardOverview> {
  return mapDashboardOverview(await apiRequest<unknown>("/api/dashboard/overview", { auth: "session" }));
}
