"use client";

import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";

import { useDeleteMutation } from "@/hooks/use-delete-mutation";
import { useDictionary } from "@/hooks/use-dictionary";
import { useListQuery } from "@/hooks/use-list-query";
import { useSaveMutation } from "@/hooks/use-save-mutation";
import type { SaveVariables } from "@/interfaces/save-variables.interface";
import { adminCatalogKeys } from "@/lib/query-keys/services/admin-catalog-keys";
import { catalogAdminKeys } from "@/lib/query-keys/services/catalog-admin-keys";
import { createCatalogItem, createCatalogTag, deleteCatalogItem, deleteCatalogTag, updateCatalogItem, updateCatalogTag } from "@/services/api/mutation/catalog-admin.mutation";
import type { CatalogItemPayload, CatalogTagPayload } from "@/services/api/mutation/catalog-admin.mutation";
import { fetchCatalogItemPage, fetchCatalogTags } from "@/services/api/query/catalog-admin.query";
import type { CatalogItem, CatalogItemPage, CatalogTag } from "@/types/catalog-item.type";

export function useCatalogItems(categoryId: string, search: string, page: number): UseQueryResult<CatalogItemPage> {
  return useListQuery(catalogAdminKeys.items(categoryId, search, page), () => fetchCatalogItemPage(categoryId, search, page));
}

export function useCatalogTags(): UseQueryResult<CatalogTag[]> {
  return useListQuery(catalogAdminKeys.tags, fetchCatalogTags);
}

/** Item writes also refresh the categories tab, whose rows count items. */
const ITEM_ROOTS = [catalogAdminKeys.all, adminCatalogKeys.all] as const;

export function useSaveCatalogItem(): UseMutationResult<CatalogItem, Error, SaveVariables<CatalogItemPayload>> {
  const { adminCatalog } = useDictionary();
  return useSaveMutation({ create: createCatalogItem, update: updateCatalogItem, invalidate: ITEM_ROOTS, messages: adminCatalog.items.toast });
}

export function useDeleteCatalogItem(): UseMutationResult<void, Error, string> {
  const { adminCatalog } = useDictionary();
  return useDeleteMutation({ remove: deleteCatalogItem, invalidate: ITEM_ROOTS, messages: adminCatalog.items.toast });
}

export function useSaveCatalogTag(): UseMutationResult<CatalogTag, Error, SaveVariables<CatalogTagPayload>> {
  const { adminCatalog } = useDictionary();
  return useSaveMutation({ create: createCatalogTag, update: updateCatalogTag, invalidate: [catalogAdminKeys.all], messages: adminCatalog.tags.toast });
}

export function useDeleteCatalogTag(): UseMutationResult<void, Error, string> {
  const { adminCatalog } = useDictionary();
  return useDeleteMutation({ remove: deleteCatalogTag, invalidate: [catalogAdminKeys.all], messages: adminCatalog.tags.toast });
}
