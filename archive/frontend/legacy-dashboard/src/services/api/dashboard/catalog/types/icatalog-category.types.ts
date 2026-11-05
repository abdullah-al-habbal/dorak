import type { z } from "zod";
import type { CatalogCategorySchema } from "@/services/api/dashboard/catalog/schemas/catalog.schema";

export type ICatalogCategory = z.infer<typeof CatalogCategorySchema>;
