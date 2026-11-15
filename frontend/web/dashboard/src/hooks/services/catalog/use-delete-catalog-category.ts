"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDeleteMutation } from "@/hooks/core/query/use-delete-mutation";
import { useDictionary } from "@/hooks/core/state/use-dictionary";
import { adminCatalogKeys } from "@/lib/query-keys/services/admin-catalog-keys";
import { serviceKeys } from "@/lib/query-keys/services/service-keys";
import { deleteCatalogCategory } from "@/services/api/mutation/services/delete-catalog-category.mutation";

/** A category still in use answers 409; its reason (deactivate instead) is shown as the toast. */
export function useDeleteCatalogCategory(): UseMutationResult<void, Error, string> {
  const { adminCatalog } = useDictionary();
  return useDeleteMutation({ remove: deleteCatalogCategory, invalidate: [adminCatalogKeys.all, serviceKeys.categories], messages: adminCatalog.toast, surfaceConflict: true });
}
