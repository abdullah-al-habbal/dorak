import type { z } from "zod";

import { jwtHeaderSchema } from "@/schemas/core/session/jwt-header.zod";

export type JwtHeader = z.infer<typeof jwtHeaderSchema>;
