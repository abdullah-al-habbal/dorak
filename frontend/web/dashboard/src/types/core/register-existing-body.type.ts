import type { z } from "zod";

import type { registerExistingBodySchema } from "@/schemas/account/register-existing-body.zod";

export type RegisterExistingBody = z.input<typeof registerExistingBodySchema>;
