import type { z } from "zod";

import { meProfileSchema } from "@/schemas/account/account/me-profile.zod";

export type MeProfile = z.infer<typeof meProfileSchema>;
