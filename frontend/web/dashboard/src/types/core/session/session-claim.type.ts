import type { z } from "zod";

import { sessionClaimSchema } from "@/schemas/core/session/session-claim.zod";

export type SessionClaim = z.infer<typeof sessionClaimSchema>;
