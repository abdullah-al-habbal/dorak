import type { z } from "zod";

import type { changePasswordFormSchema } from "@/schemas/account/credentials/change-password-form.zod";

export type ChangePasswordFormValues = z.input<ReturnType<typeof changePasswordFormSchema>>;
