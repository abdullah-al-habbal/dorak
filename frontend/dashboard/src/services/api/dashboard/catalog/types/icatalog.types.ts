import type { z } from "zod";
import type {
  CatalogCategorySchema,
  CatalogItemSchema,
  CatalogTagSchema,
  catalogItemFormSchema,
} from "@/services/api/dashboard/catalog/schemas/catalog.schema";

export type ICatalogItem = z.infer<typeof CatalogItemSchema>;
export type ICatalogCategory = z.infer<typeof CatalogCategorySchema>;
export type ICatalogTag = z.infer<typeof CatalogTagSchema>;
export type ICatalogItemFormInput = z.input<typeof catalogItemFormSchema>;
export type ICatalogItemForm = z.output<typeof catalogItemFormSchema>;
