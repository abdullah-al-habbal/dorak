import type { z } from "zod";
import type { CatalogItemSchema } from "@/services/api/dashboard/catalog/schemas/catalog.schema";

export type ICatalogItem = z.infer<typeof CatalogItemSchema>;
