import type { z } from "zod";

import { loginDataSchema } from "@/schemas/login-data.zod";

export type LoginData = z.infer<typeof loginDataSchema>;
