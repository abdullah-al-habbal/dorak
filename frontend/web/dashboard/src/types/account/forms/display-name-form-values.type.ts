import type { z } from "zod";

import type { displayNameFormSchema } from "@/schemas/account/account/display-name-form.zod";

export type DisplayNameFormValues = z.input<ReturnType<typeof displayNameFormSchema>>;
