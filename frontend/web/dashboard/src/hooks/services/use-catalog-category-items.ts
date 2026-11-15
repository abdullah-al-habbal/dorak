"use client";

import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { adminCatalogKeys } from "@/lib/query-keys/services/admin-catalog-keys";
import { fetchCatalogCategoryItems } from "@/services/api/query/services/catalog-category-items.query";
import type { CatalogItemsPreview } from "@/types/services/catalog-items-preview.type";

/** A detail read for one category's dialog; it lives under the module root, so any category write refreshes it. */
export function useCatalogCategoryItems(categoryId: string): UseQueryResult<CatalogItemsPreview> {
  return useQuery({ queryKey: adminCatalogKeys.items(categoryId), queryFn: () => fetchCatalogCategoryItems(categoryId) });
}
