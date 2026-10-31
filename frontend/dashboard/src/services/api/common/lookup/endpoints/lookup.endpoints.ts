import { LOOKUP_API_BASE_PATH } from "@/services/api/common/lookup/endpoints/lookup.endpoints.constant";
export const LookupEndpoints = {
  options: (resource: string) => `${LOOKUP_API_BASE_PATH}/${resource}`,
} as const;
