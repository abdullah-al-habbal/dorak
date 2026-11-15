import type { z } from "zod";

import type { passwordPairSchema } from "@/schemas/fields/password-pair.zod";

export type PasswordPairValues = z.input<ReturnType<typeof passwordPairSchema>>;
