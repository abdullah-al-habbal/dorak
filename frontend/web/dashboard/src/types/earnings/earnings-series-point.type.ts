import type { z } from "zod";

import type { earningsSeriesPointSchema } from "@/schemas/earnings/earnings.zod";

export type EarningsSeriesPoint = z.infer<typeof earningsSeriesPointSchema>;
