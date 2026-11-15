import { createQueryKeys } from "@/lib/core/create-query-keys.util";
import type { StylistFilters } from "@/types/stylists/stylist-filters.type";

export const stylistKeys = createQueryKeys("stylists", {
  list: (filters: StylistFilters) => ["list", filters] as const,
});
