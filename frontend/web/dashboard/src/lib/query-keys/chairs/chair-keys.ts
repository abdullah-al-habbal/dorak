import { createQueryKeys } from "@/lib/core/query/create-query-keys.util";
import type { ChairFilters } from "@/types/chairs/chair-filters.type";

export const chairKeys = createQueryKeys("chairs", {
  list: (filters: ChairFilters) => ["list", filters] as const,
});
