import { createQueryKeys } from "@/lib/core/query/create-query-keys.util";
import type { ClientFilters } from "@/types/clients/clients/client-filters.type";

export const clientKeys = createQueryKeys("admin-clients", {
  list: (filters: ClientFilters) => ["list", filters] as const,
  detail: (id: string) => ["detail", id] as const,
  relation: (id: string, relation: string) => ["relation", id, relation] as const,
});
