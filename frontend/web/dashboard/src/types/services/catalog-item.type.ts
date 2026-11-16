import type { z } from "zod";

import type { catalogItemSchema, catalogMediumSchema, catalogTagSchema } from "@/schemas/services/catalog-item.zod";
import type { PageInfo } from "@/types/core/shared/page-info.type";

export type CatalogItem = z.infer<typeof catalogItemSchema>;
export type CatalogMedium = z.infer<typeof catalogMediumSchema>;
export type CatalogTag = z.infer<typeof catalogTagSchema>;

export interface CatalogItemPage {
  items: CatalogItem[];
  page: PageInfo;
}
