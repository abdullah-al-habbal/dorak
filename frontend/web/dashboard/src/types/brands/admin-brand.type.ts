import type { z } from "zod";

import type { adminBrandSchema } from "@/schemas/admin-brand.zod";

export type AdminBrand = z.infer<typeof adminBrandSchema>;
