import type { z } from "zod";

import type { forgotPasswordFormSchema } from "@/schemas/forgot-password-form.zod";

export type ForgotPasswordFormValues = z.input<ReturnType<typeof forgotPasswordFormSchema>>;
