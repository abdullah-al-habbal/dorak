import type { AdminCatalogCategory } from "@/types/admin-catalog-category.type";

/**
 * Flips one top-level category's active flag in a cached list; the same list when it is absent.
 * Subcategories are read-only on the dashboard and keep their own flag (the backend never cascades).
 */
export function withCategoryActive(list: AdminCatalogCategory[] | undefined, id: string, active: boolean): AdminCatalogCategory[] | undefined {
  if (!list?.some((category) => category.id === id)) return list;
  return list.map((category) => (category.id === id ? { ...category, is_active: active } : category));
}
