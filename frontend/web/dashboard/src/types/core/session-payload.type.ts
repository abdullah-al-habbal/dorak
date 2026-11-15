import type { z } from "zod";

import type { sessionPayloadSchema } from "@/schemas/session-payload.zod";

export type SessionPayload = z.infer<typeof sessionPayloadSchema>;
