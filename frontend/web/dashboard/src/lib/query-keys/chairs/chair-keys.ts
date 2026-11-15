import { createQueryKeys } from "@/lib/create-query-keys.util";
import type { ChairFilters } from "@/types/chairs/chair-filters.type";

export const chairKeys = createQueryKeys("chairs", {
  list: (filters: ChairFilters) => ["list", filters] as const,
});
