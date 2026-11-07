import type { ChairFilters } from "@/types/chair-filters.type";

export const chairKeys = {
  all: ["chairs"] as const,
  list: (filters: ChairFilters) => ["chairs", "list", filters] as const,
};
