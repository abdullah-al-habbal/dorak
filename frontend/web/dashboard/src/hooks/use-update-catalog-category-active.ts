"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/use-dictionary";
import { useOptimisticToggleMutation } from "@/hooks/use-optimistic-toggle-mutation";
import type { OptimisticToggleContext } from "@/interfaces/optimistic-toggle-context.interface";
import { adminCatalogKeys } from "@/lib/admin-catalog-keys";
import { withCategoryActive } from "@/lib/catalog-category-cache.util";
import { serviceKeys } from "@/lib/service-keys";
import { setCatalogCategoryActive } from "@/services/api/mutation/save-catalog-category.mutation";
import type { AdminCatalogCategory, CatalogSubcategory } from "@/types/admin-catalog-category.type";

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
