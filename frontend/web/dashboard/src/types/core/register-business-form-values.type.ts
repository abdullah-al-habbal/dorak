import type { z } from "zod";

import type { registerBusinessFormSchema } from "@/schemas/account/register-business-form.zod";

export type RegisterBusinessFormValues = z.input<ReturnType<typeof registerBusinessFormSchema>>;
