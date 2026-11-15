import type { z } from "zod";

import { loginFormSchema } from "@/schemas/core/login-form.zod";

export type LoginFormValues = z.infer<typeof loginFormSchema>;
