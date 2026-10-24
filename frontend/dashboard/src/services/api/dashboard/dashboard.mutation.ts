import { apiRequest } from "@/services/api/client";
import type { DashboardEntityId } from "@/services/api/dashboard/dashboard-entity-id.types";
import { DashboardEndpoints } from "@/services/api/dashboard/endpoints/dashboard.endpoints";

export function mutateDashboardEntity<TData, TInput>(
  resource: string,
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  input?: TInput,
  id?: DashboardEntityId,
) {
  const path = id
    ? DashboardEndpoints.resourceById(resource, id)
    : DashboardEndpoints.resource(resource);
  return apiRequest<TData>(path, {
    auth: "session",
    method,
    ...(input === undefined ? {} : { body: JSON.stringify(input) }),
  });
}
