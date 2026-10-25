import { api } from "@/services/api/client";
import { LookupEndpoints } from "@/services/api/lookup/endpoints/lookup.endpoints";
import type { LookupOption, LookupResource } from "@/services/api/lookup.types";

export function getLookupOptions(
  resource: LookupResource,
): Promise<LookupOption[]> {
  return api.get<LookupOption[]>(LookupEndpoints.options(resource));
}
