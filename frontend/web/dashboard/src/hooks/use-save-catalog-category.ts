"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { useDictionary } from "@/hooks/use-dictionary";
import { useSaveMutation } from "@/hooks/use-save-mutation";
import type { CatalogCategoryPayload } from "@/interfaces/services/catalog-category-payload.interface";
import type { SaveVariables } from "@/interfaces/core/save-variables.interface";
import { adminCatalogKeys } from "@/lib/query-keys/services/admin-catalog-keys";
import { serviceKeys } from "@/lib/query-keys/services/service-keys";
import { createCatalogCategory, updateCatalogCategory } from "@/services/api/mutation/save-catalog-category.mutation";
import type { CatalogSubcategory } from "@/types/services/admin-catalog-category.type";

/** Also refreshes the service form's category picker, which lists the same global categories. */
export function useSaveCatalogCategory(): UseMutationResult<CatalogSubcategory, Error, SaveVariables<CatalogCategoryPayload>> {
  const { adminCatalog } = useDictionary();
  return useSaveMutation({
    create: createCatalogCategory,
    update: updateCatalogCategory,
    invalidate: [adminCatalogKeys.all, serviceKeys.categories],
    messages: adminCatalog.toast,
  });
}
