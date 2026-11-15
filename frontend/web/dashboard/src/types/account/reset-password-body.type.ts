import type { z } from "zod";

import type { resetPasswordBodySchema } from "@/schemas/account/reset-password-body.zod";

export type ResetPasswordBody = z.input<typeof resetPasswordBodySchema>;
