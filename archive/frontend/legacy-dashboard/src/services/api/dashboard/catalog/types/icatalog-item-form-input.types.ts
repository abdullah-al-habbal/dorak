import type { z } from "zod";
import type { catalogItemFormSchema } from "@/services/api/dashboard/catalog/schemas/catalog.schema";

export type ICatalogItemFormInput = z.input<typeof catalogItemFormSchema>;
