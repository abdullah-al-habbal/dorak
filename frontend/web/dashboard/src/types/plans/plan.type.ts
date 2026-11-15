import type { z } from "zod";

import type { planSchema } from "@/schemas/plans/plan.zod";

export type Plan = z.infer<typeof planSchema>;
