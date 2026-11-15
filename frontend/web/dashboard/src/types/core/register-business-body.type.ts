import type { z } from "zod";

import type { registerBusinessBodySchema } from "@/schemas/register-business-body.zod";

export type RegisterBusinessBody = z.input<typeof registerBusinessBodySchema>;
