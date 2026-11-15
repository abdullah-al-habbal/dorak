import type { z } from "zod";

import { loginFormSchema } from "@/schemas/core/session/login-form.zod";

export type LoginFormValues = z.infer<typeof loginFormSchema>;
