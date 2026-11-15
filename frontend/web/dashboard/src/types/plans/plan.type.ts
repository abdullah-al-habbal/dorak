import type { z } from "zod";

import type { planSchema } from "@/schemas/plan.zod";

export type Plan = z.infer<typeof planSchema>;
