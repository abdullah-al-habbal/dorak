import type { z } from "zod";

import { loginBodySchema } from "@/schemas/core/session/login-body.zod";

export type LoginBody = z.infer<typeof loginBodySchema>;
