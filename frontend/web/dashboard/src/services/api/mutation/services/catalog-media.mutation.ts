import { z } from "zod";

import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/access/http-method.enum";
import { apiRequest } from "@/services/api/core/client";
import { uploadImage } from "@/services/api/mutation/core/upload-image.mutation";
import { catalogMediumSchema } from "@/schemas/services/catalog-item.zod";
import type { CatalogMedium } from "@/types/services/catalog-item.type";

function mediaPath(itemId: string): string {
  return `${DASHBOARD_API}/admin/catalog-items/${encodeURIComponent(itemId)}/media`;
}

export function uploadCatalogItemMedia(itemId: string, file: File): Promise<CatalogMedium> {
  return uploadImage(mediaPath(itemId), file, catalogMediumSchema);
}

export async function deleteCatalogItemMedia(itemId: string, mediaId: string): Promise<void> {
  await apiRequest(`${mediaPath(itemId)}/${encodeURIComponent(mediaId)}`, { method: HttpMethod.Delete, schema: z.unknown() });
}
