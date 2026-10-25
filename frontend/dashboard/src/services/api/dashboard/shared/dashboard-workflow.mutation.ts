import { api } from "@/services/api/core/client";
import type { DashboardEntityId } from "@/services/api/dashboard/shared/types/dashboard-entity-id.types";
import { DashboardEndpoints } from "@/services/api/dashboard/endpoints/dashboard.endpoints";

export function createDashboardEntity<TData>(
  resource: "branches" | "chairs" | "services" | "stylists",
  payload: unknown,
) {
  return api.post<TData>(DashboardEndpoints.resource(resource), payload);
}

export function updateDashboardEntity<TData>(
  resource: "branches" | "chairs" | "services" | "stylists",
  id: DashboardEntityId,
  payload: unknown,
) {
  return api.put<TData>(DashboardEndpoints.resourceById(resource, id), payload);
}
