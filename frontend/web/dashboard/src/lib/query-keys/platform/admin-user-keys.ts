import { createQueryKeys } from "@/lib/core/create-query-keys.util";
import type { AdminUserFilters } from "@/types/platform/admin-user-filters.type";

export const adminUserKeys = createQueryKeys("admin-users", {
  list: (filters: AdminUserFilters) => ["list", filters] as const,
});
