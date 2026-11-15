import type { z } from "zod";

import { sessionKeyRingSchema } from "@/schemas/core/session-keys.zod";

export type SessionKeyRing = z.infer<typeof sessionKeyRingSchema>;
