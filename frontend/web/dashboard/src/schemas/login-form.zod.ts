import { z } from "zod";

import { MAX_PASSWORD_LENGTH } from "@/schemas/login-body.zod";

export const loginFormSchema = z.object({
  email: z.email({ error: "emailInvalid" }),
  password: z
    .string()
    .min(1, { error: "passwordRequired" })
    .max(MAX_PASSWORD_LENGTH, { error: "passwordRequired" }),
});
