import type { z } from "zod";

import type { catalogItemPreviewSchema } from "@/schemas/catalog-item-preview.zod";

export type CatalogItemPreview = z.infer<typeof catalogItemPreviewSchema>;
