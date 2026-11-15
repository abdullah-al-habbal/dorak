import type { z } from "zod";

import type { forgotPasswordFormSchema } from "@/schemas/account/credentials/forgot-password-form.zod";

export type ForgotPasswordFormValues = z.input<ReturnType<typeof forgotPasswordFormSchema>>;
