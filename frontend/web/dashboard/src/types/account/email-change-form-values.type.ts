import type { z } from "zod";

import type { emailChangeFormSchema } from "@/schemas/email-change-form.zod";

export type EmailChangeFormValues = z.input<ReturnType<typeof emailChangeFormSchema>>;
