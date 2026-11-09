import type { z } from "zod";

import type { changePasswordBodySchema } from "@/schemas/change-password-body.zod";

export type ChangePasswordBody = z.input<typeof changePasswordBodySchema>;
