import type { z } from "zod";

import type { platformSettingSchema } from "@/schemas/platform-setting.zod";

export type PlatformSetting = z.infer<typeof platformSettingSchema>;
