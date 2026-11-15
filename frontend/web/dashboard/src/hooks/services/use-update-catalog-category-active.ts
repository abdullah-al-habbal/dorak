"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/core/use-dictionary";
import { useOptimisticToggleMutation } from "@/hooks/core/use-optimistic-toggle-mutation";
import type { OptimisticToggleContext } from "@/interfaces/core/optimistic-toggle-context.interface";
import { adminCatalogKeys } from "@/lib/query-keys/services/admin-catalog-keys";
import { withCategoryActive } from "@/lib/services/catalog-category-cache.util";
import { serviceKeys } from "@/lib/query-keys/services/service-keys";
import { setCatalogCategoryActive } from "@/services/api/mutation/save-catalog-category.mutation";
import type { AdminCatalogCategory, CatalogSubcategory } from "@/types/services/admin-catalog-category.type";

interface ToggleVariables {
  id: string;
  active: boolean;
}

/** Optimistic switch; the owners' category picker (active categories only) is refreshed once it settles. */
export function useUpdateCatalogCategoryActive(): UseMutationResult<CatalogSubcategory, Error, ToggleVariables, OptimisticToggleContext<AdminCatalogCategory[]>> {
  const { adminCatalog } = useDictionary();
  return useOptimisticToggleMutation<CatalogSubcategory, ToggleVariables, AdminCatalogCategory[]>({
    queryKey: adminCatalogKeys.all,
    mutationFn: ({ id, active }) => setCatalogCategoryActive(id, active),
    patch: (list, { id, active }) => withCategoryActive(list, id, active),
    successMessage: ({ active }) => (active ? adminCatalog.toast.activated : adminCatalog.toast.deactivated),
    failureMessage: adminCatalog.toast.toggleFailed,
    invalidate: [serviceKeys.categories],
  });
}
