import type { LookupResource } from "@/services/api/common/lookup/types/lookup.types";

export const LOOKUP_PROXY_PATHS: Record<LookupResource, string> = {
  brands: "/api/v1/brands",
  currencies: "/api/v1/currencies",
  "service-catalog-items": "/api/v1/service-catalog/items",
};
