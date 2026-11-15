import type { z } from "zod";

import { loginDataSchema } from "@/schemas/core/session/login-data.zod";

export type LoginData = z.infer<typeof loginDataSchema>;
