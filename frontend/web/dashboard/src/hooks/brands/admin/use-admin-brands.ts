"use client";

import type { UseQueryResult } from "@tanstack/react-query";

import { useListQuery } from "@/hooks/core/query/use-list-query";
import { adminBrandKeys } from "@/lib/query-keys/brands/admin-brand-keys";
import { fetchAdminBrandPage } from "@/services/api/query/brands/admin-brand-page.query";
import type { AdminBrandFilters } from "@/types/brands/admin-brand-filters.type";
import type { AdminBrandPage } from "@/types/brands/admin-brand-page.type";

export function useAdminBrands(filters: AdminBrandFilters): UseQueryResult<AdminBrandPage> {
  return useListQuery(adminBrandKeys.list(filters), () => fetchAdminBrandPage(filters));
}
