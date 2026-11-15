import type { z } from "zod";

import type { serviceCategorySchema } from "@/schemas/services/service-category.zod";

export type ServiceCategory = z.infer<typeof serviceCategorySchema>;
