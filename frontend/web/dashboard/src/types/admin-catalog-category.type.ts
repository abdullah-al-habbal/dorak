import type { z } from "zod";

import type { adminCatalogCategorySchema, catalogSubcategorySchema } from "@/schemas/admin-catalog-category.zod";

export type AdminCatalogCategory = z.infer<typeof adminCatalogCategorySchema>;

export type CatalogSubcategory = z.infer<typeof catalogSubcategorySchema>;
