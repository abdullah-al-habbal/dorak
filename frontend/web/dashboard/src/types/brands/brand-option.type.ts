import type { z } from "zod";

import type { brandOptionSchema } from "@/schemas/branches/branch.zod";

export type BrandOption = z.infer<typeof brandOptionSchema>;
