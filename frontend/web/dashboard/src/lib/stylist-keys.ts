import type { StylistFilters } from "@/types/stylist-filters.type";

export const stylistKeys = {
  all: ["stylists"] as const,
  list: (filters: StylistFilters) => ["stylists", "list", filters] as const,
};
