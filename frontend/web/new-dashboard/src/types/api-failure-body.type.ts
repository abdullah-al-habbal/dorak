import type { z } from "zod";

import { apiFailureBodySchema } from "@/schemas/api-failure-body.zod";

export type ApiFailureBody = z.infer<typeof apiFailureBodySchema>;
