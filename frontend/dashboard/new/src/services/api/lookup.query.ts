import { apiRequest } from "@/services/api/client";
import type { LookupOption, LookupResource } from "@/services/api/lookup.types";

export function getLookupOptions(resource: LookupResource): Promise<LookupOption[]> {
  return apiRequest<LookupOption[]>(`/api/lookups/${resource}`, { auth: "session" });
}
