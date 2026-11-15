import type { z } from "zod";

import type { accountProfileSchema } from "@/schemas/account-profile.zod";

export type AccountProfile = z.infer<typeof accountProfileSchema>;
