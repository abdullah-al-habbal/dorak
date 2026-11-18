import type { z } from "zod";

import type { createCatalogItemFormSchema } from "@/schemas/services/catalog/catalog-item-form.zod";

export type CatalogItemFormValues = z.input<ReturnType<typeof createCatalogItemFormSchema>>;
