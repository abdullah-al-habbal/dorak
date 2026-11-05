import { api } from "@/services/api/core/client";
import { LookupEndpoints } from "@/services/api/common/lookup/endpoints/lookup.endpoints";
import type {
  LookupOption,
  LookupResource,
} from "@/services/api/common/lookup/types/lookup.types";

export function getLookupOptions(
  resource: LookupResource,
): Promise<LookupOption[]> {
  return api.get<LookupOption[]>(LookupEndpoints.options(resource));
}
