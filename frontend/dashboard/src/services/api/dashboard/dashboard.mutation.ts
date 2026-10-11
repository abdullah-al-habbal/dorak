import { apiRequest } from "@/services/api/client";
import type { DashboardEntityId } from "@/services/api/dashboard/dashboard-entity-id.types";

export function mutateDashboardEntity<TData, TInput>(
  resource: string,
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  input?: TInput,
  id?: DashboardEntityId,
) {
  const suffix = id ? `/${encodeURIComponent(id)}` : "";
  return apiRequest<TData>(`/api/dashboard/${resource}${suffix}`, {
    auth: "session",
    method,
    ...(input === undefined ? {} : { body: JSON.stringify(input) }),
  });
}
