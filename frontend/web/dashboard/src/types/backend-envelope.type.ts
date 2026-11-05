import type { z } from "zod";

import { backendEnvelopeSchema } from "@/schemas/backend-envelope.zod";

export type BackendEnvelope = z.infer<typeof backendEnvelopeSchema>;
