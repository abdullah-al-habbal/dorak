import type { CatalogItemPreview } from "@/types/catalog-item-preview.type";

/** One page of a category's items, and how many exist in all (the preview shows the first page only). */
export interface CatalogItemsPreview {
  items: CatalogItemPreview[];
  total: number;
}
