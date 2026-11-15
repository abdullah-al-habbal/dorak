import type { z } from "zod";

import { apiFailureBodySchema } from "@/schemas/core/api/api-failure-body.zod";

export type ApiFailureBody = z.infer<typeof apiFailureBodySchema>;
