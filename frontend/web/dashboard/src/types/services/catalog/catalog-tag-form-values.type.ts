import type { z } from "zod";

import type { createCatalogTagFormSchema } from "@/schemas/services/catalog/catalog-tag-form.zod";

export type CatalogTagFormValues = z.input<ReturnType<typeof createCatalogTagFormSchema>>;
