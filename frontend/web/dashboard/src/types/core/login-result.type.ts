import type { z } from "zod";

import type { loginResultSchema } from "@/schemas/core/login-result.zod";

export type LoginResult = z.infer<typeof loginResultSchema>;
