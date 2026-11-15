import type { z } from "zod";

import type { sessionPayloadSchema } from "@/schemas/core/session/session-payload.zod";

export type SessionPayload = z.infer<typeof sessionPayloadSchema>;
