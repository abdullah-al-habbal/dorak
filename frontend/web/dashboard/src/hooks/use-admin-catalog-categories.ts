"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { useListQuery } from "@/hooks/use-list-query";
import { adminCatalogKeys } from "@/lib/query-keys/services/admin-catalog-keys";
import { fetchAdminCatalogCategories } from "@/services/api/query/admin-catalog-categories.query";
import type { AdminCatalogCategory } from "@/types/services/admin-catalog-category.type";
import type { AdminCatalogFilters } from "@/types/services/admin-catalog-filters.type";

export function useAdminCatalogCategories(filters: AdminCatalogFilters): UseQueryResult<AdminCatalogCategory[]> {
  return useListQuery(adminCatalogKeys.list(filters), () => fetchAdminCatalogCategories(filters));
}
