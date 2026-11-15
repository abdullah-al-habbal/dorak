import type { z } from "zod";

import type { resetPasswordBodySchema } from "@/schemas/reset-password-body.zod";

export type ResetPasswordBody = z.input<typeof resetPasswordBodySchema>;
