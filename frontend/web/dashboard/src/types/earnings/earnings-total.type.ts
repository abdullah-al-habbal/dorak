import type { z } from "zod";

import type { earningsTotalSchema } from "@/schemas/earnings.zod";

export type EarningsTotal = z.infer<typeof earningsTotalSchema>;
