import type { z } from "zod";

import type { emailChangeResultSchema } from "@/schemas/account/email-change-result.zod";

export type EmailChangeResult = z.infer<typeof emailChangeResultSchema>;
