import type { z } from "zod";

import type { adminPayoutSchema } from "@/schemas/earnings/admin-payout.zod";

export type AdminPayout = z.infer<typeof adminPayoutSchema>;
