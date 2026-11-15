"use client";

import { useUrlFilters } from "@/hooks/core/use-url-filters";
import { adminUserFiltersFromParams, adminUserFiltersToParams } from "@/lib/platform/admin-user-filters.util";
import type { AdminUserFilters } from "@/types/platform/admin-user-filters.type";

export function useAdminUserFilters(): { filters: AdminUserFilters; update: (patch: Partial<AdminUserFilters>) => void } {
  return useUrlFilters(adminUserFiltersFromParams, adminUserFiltersToParams);
}
