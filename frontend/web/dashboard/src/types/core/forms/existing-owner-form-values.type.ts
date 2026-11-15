import type { z } from "zod";

import type { existingOwnerFormSchema } from "@/schemas/account/register/register-business-form.zod";

export type ExistingOwnerFormValues = z.input<ReturnType<typeof existingOwnerFormSchema>>;
