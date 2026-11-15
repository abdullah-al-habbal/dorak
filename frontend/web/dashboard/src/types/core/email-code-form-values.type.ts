import type { z } from "zod";

import type { emailCodeFormSchema } from "@/schemas/email-code-form.zod";

export type EmailCodeFormValues = z.input<ReturnType<typeof emailCodeFormSchema>>;
