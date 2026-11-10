import { createQueryKeys } from "@/lib/create-query-keys.util";
import type { AdminUserFilters } from "@/types/admin-user-filters.type";

export const adminUserKeys = createQueryKeys("admin-users", {
  list: (filters: AdminUserFilters) => ["list", filters] as const,
});
