import type { z } from "zod";

import { loginFormSchema } from "@/schemas/login-form.zod";

export type LoginFormValues = z.infer<typeof loginFormSchema>;
