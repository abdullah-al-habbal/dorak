"use client";

import { useUrlFilters } from "@/hooks/use-url-filters";
import { adminUserFiltersFromParams, adminUserFiltersToParams } from "@/lib/admin-user-filters.util";
import type { AdminUserFilters } from "@/types/admin-user-filters.type";

export function useAdminUserFilters(): { filters: AdminUserFilters; update: (patch: Partial<AdminUserFilters>) => void } {
  return useUrlFilters(adminUserFiltersFromParams, adminUserFiltersToParams);
}
