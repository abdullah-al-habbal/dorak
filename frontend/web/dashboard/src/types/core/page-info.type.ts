import type { z } from "zod";

import type { pageInfoSchema } from "@/schemas/core/page-info.zod";

export type PageInfo = z.infer<typeof pageInfoSchema>;
