import type { z } from "zod";

import type { forgotPasswordBodySchema } from "@/schemas/account/credentials/forgot-password-body.zod";

export type ForgotPasswordBody = z.input<typeof forgotPasswordBodySchema>;
