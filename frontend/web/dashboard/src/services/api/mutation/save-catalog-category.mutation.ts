import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/http-method.enum";
import type { CatalogCategoryPayload } from "@/interfaces/catalog-category-payload.interface";
import { catalogSubcategorySchema } from "@/schemas/admin-catalog-category.zod";
import { apiRequest } from "@/services/api/core/client";
import type { CatalogSubcategory } from "@/types/admin-catalog-category.type";

const CATEGORIES = `${DASHBOARD_API}/admin/catalog-categories`;

function categoryPath(id: string): string {
  return `${CATEGORIES}/${encodeURIComponent(id)}`;
}

/** Write responses carry the category and its counts, without subcategories. */
export function createCatalogCategory(payload: CatalogCategoryPayload): Promise<CatalogSubcategory> {
  return apiRequest(CATEGORIES, { method: HttpMethod.Post, body: payload, schema: catalogSubcategorySchema });
}

export function updateCatalogCategory(id: string, payload: CatalogCategoryPayload): Promise<CatalogSubcategory> {
  return apiRequest(categoryPath(id), { method: HttpMethod.Put, body: payload, schema: catalogSubcategorySchema });
}

export function setCatalogCategoryActive(id: string, active: boolean): Promise<CatalogSubcategory> {
  return apiRequest(`${categoryPath(id)}/active`, { method: HttpMethod.Patch, body: { is_active: active }, schema: catalogSubcategorySchema });
}
