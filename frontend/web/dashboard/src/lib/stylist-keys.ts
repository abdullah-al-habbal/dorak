import { createQueryKeys } from "@/lib/create-query-keys.util";
import type { StylistFilters } from "@/types/stylist-filters.type";

export const stylistKeys = createQueryKeys("stylists", {
  list: (filters: StylistFilters) => ["list", filters] as const,
});
