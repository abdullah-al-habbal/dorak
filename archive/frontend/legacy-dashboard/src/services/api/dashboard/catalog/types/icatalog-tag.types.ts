import type { z } from "zod";
import type { CatalogTagSchema } from "@/services/api/dashboard/catalog/schemas/catalog.schema";

export type ICatalogTag = z.infer<typeof CatalogTagSchema>;
