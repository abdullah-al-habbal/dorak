import type { z } from "zod";

import { sessionClaimSchema } from "@/schemas/session-claim.zod";

export type SessionClaim = z.infer<typeof sessionClaimSchema>;
