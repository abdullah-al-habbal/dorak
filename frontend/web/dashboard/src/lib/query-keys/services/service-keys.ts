import type { ServiceFilters } from "@/types/services/service-filters.type";
import { createQueryKeys, queryKey } from "@/lib/core/query/create-query-keys.util";

export const serviceKeys = {
  ...createQueryKeys("services", {
    list: (filters: ServiceFilters) => ["list", filters.search ?? "", filters.brandId ?? ""] as const,
  }),
  currencies: queryKey("currencies"),
  // Not under "services": a service write must not refetch the category list, and vice versa.
  categories: queryKey("service-categories"),
};
