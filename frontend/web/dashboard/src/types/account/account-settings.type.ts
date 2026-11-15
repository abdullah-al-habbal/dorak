import type { z } from "zod";

import type { accountSettingsSchema } from "@/schemas/account/account-settings.zod";

export type AccountSettings = z.infer<typeof accountSettingsSchema>;
