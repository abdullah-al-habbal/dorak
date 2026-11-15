import { z } from "zod";

import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/access/http-method.enum";
import { catalogItemSchema, catalogTagSchema } from "@/schemas/services/catalog-item.zod";
import { apiRequest } from "@/services/api/core/client";
import type { CatalogItem, CatalogTag } from "@/types/services/catalog-item.type";

type Translated = { en: string; ar: string };

export interface CatalogItemPayload {
  category_id: string;
  name: Translated;
  description: { en: string | null; ar: string | null };
  slug: string;
  default_duration_minutes: number | null;
  is_active: boolean;
  tag_ids: string[];
}

export interface CatalogTagPayload {
  name: Translated;
  group_name: string | null;
  is_active?: boolean;
}

const ITEMS = `${DASHBOARD_API}/admin/catalog-items`;
const TAGS = `${DASHBOARD_API}/admin/catalog-tags`;

export function createCatalogItem(payload: CatalogItemPayload): Promise<CatalogItem> {
  return apiRequest(ITEMS, { method: HttpMethod.Post, body: payload, schema: catalogItemSchema });
}

export function updateCatalogItem(id: string, payload: CatalogItemPayload): Promise<CatalogItem> {
  return apiRequest(`${ITEMS}/${encodeURIComponent(id)}`, { method: HttpMethod.Put, body: payload, schema: catalogItemSchema });
}

export async function deleteCatalogItem(id: string): Promise<void> {
  await apiRequest(`${ITEMS}/${encodeURIComponent(id)}`, { method: HttpMethod.Delete, schema: z.unknown() });
}

export function createCatalogTag(payload: CatalogTagPayload): Promise<CatalogTag> {
  return apiRequest(TAGS, { method: HttpMethod.Post, body: payload, schema: catalogTagSchema });
}

export function updateCatalogTag(id: string, payload: CatalogTagPayload): Promise<CatalogTag> {
  return apiRequest(`${TAGS}/${encodeURIComponent(id)}`, { method: HttpMethod.Put, body: payload, schema: catalogTagSchema });
}

export async function deleteCatalogTag(id: string): Promise<void> {
  await apiRequest(`${TAGS}/${encodeURIComponent(id)}`, { method: HttpMethod.Delete, schema: z.unknown() });
}
