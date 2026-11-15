import type { z } from "zod";

import type { serviceCategorySchema } from "@/schemas/service-category.zod";

export type ServiceCategory = z.infer<typeof serviceCategorySchema>;
