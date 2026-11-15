import type { z } from "zod";

import type { payoutSchema } from "@/schemas/payout.zod";

export type Payout = z.infer<typeof payoutSchema>;
