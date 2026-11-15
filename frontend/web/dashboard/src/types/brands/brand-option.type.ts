import type { z } from "zod";

import type { brandOptionSchema } from "@/schemas/branch.zod";

export type BrandOption = z.infer<typeof brandOptionSchema>;
