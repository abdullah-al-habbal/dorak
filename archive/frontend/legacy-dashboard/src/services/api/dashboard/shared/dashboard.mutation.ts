import { api } from "@/services/api/core/client";
import type { DashboardEntityId } from "@/services/api/dashboard/shared/types/dashboard-entity-id.types";
import { DashboardEndpoints } from "@/services/api/dashboard/endpoints/dashboard.endpoints";
import type { HttpMethod } from "@/services/api/core/types/http-method.types";

export function mutateDashboardEntity<TData, TInput>(
  resource: string,
  method: Extract<HttpMethod, "POST" | "PATCH" | "PUT" | "DELETE">,
  input?: TInput,
  id?: DashboardEntityId,
) {
  const path = id
    ? DashboardEndpoints.resourceById(resource, id)
    : DashboardEndpoints.resource(resource);
  switch (method) {
    case "DELETE":
      return api.delete<TData>(path);
    case "POST":
      return api.post<TData>(path, input);
    case "PUT":
      return api.put<TData>(path, input);
    case "PATCH":
    default:
      return api.patch<TData>(path, input);
  }
}
