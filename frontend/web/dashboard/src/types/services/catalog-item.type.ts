import type { z } from "zod";

import type { catalogItemSchema, catalogTagSchema } from "@/schemas/catalog-item.zod";
import type { PageInfo } from "@/types/core/page-info.type";

export type CatalogItem = z.infer<typeof catalogItemSchema>;
export type CatalogTag = z.infer<typeof catalogTagSchema>;

export interface CatalogItemPage {
  items: CatalogItem[];
  page: PageInfo;
}
