import type { z } from "zod";

import { loginDataSchema } from "@/schemas/core/login-data.zod";

export type LoginData = z.infer<typeof loginDataSchema>;
