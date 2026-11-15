import type { z } from "zod";

import type { catalogItemPreviewSchema } from "@/schemas/services/catalog-item-preview.zod";

export type CatalogItemPreview = z.infer<typeof catalogItemPreviewSchema>;
