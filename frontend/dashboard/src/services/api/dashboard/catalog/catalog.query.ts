import { api } from "@/services/api/core/client";
import { DashboardEndpoints } from "@/services/api/dashboard/endpoints/dashboard.endpoints";
import {
  catalogItemPayload,
  mapCatalogCategory,
  mapCatalogItem,
  mapCatalogTag,
} from "@/services/api/dashboard/catalog/catalog.mapper.util";
import type { ICatalogCategory } from "@/services/api/dashboard/catalog/types/icatalog-category.types";
import type { ICatalogItem } from "@/services/api/dashboard/catalog/types/icatalog-item.types";
import type { ICatalogItemForm } from "@/services/api/dashboard/catalog/types/icatalog-item-form.types";
import type { ICatalogTag } from "@/services/api/dashboard/catalog/types/icatalog-tag.types";
import type { IDashboardPage } from "@/services/api/dashboard/shared/types/idashboard-page.types";

export const catalogItemsQueryKey = (search: string, page: number) =>
  ["dashboard", "catalog-items", search, page] as const;
export const catalogCategoriesQueryKey = [
  "dashboard",
  "catalog-categories",
] as const;
export const catalogTagsQueryKey = ["dashboard", "catalog-tags"] as const;

export async function getCatalogItems(
  search: string,
  page: number,
): Promise<IDashboardPage<ICatalogItem>> {
  const query = new URLSearchParams({ page: String(page) });
  if (search !== "") query.set("search", search);
  const result = await api.get<IDashboardPage<unknown>>(
    `${DashboardEndpoints.catalogItems}?${query}`,
  );
  return { ...result, items: result.items.map(mapCatalogItem) };
}

export async function getCatalogCategories(): Promise<ICatalogCategory[]> {
  const result = await api.get<unknown[]>(DashboardEndpoints.catalogCategories);
  return result.map(mapCatalogCategory);
}

export async function getCatalogTags(): Promise<ICatalogTag[]> {
  const result = await api.get<unknown[]>(DashboardEndpoints.catalogTags);
  return result.map(mapCatalogTag);
}

export function createCatalogItem(form: ICatalogItemForm) {
  return api.post<unknown>(
    DashboardEndpoints.catalogItems,
    catalogItemPayload(form),
  );
}

export function updateCatalogItem(id: string, form: ICatalogItemForm) {
  return api.put<unknown>(
    DashboardEndpoints.catalogItem(id),
    catalogItemPayload(form),
  );
}

export function deleteCatalogItem(id: string) {
  return api.delete<unknown>(DashboardEndpoints.catalogItem(id));
}
