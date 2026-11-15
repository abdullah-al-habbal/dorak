import type { z } from "zod";

import type { earningsSchema } from "@/schemas/earnings/earnings.zod";

export type Earnings = z.infer<typeof earningsSchema>;
