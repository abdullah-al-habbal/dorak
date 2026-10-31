import type { z } from "zod";
import type { PlatformSettingSchema } from "@/services/api/dashboard/settings/schemas/settings.schema";

export type IPlatformSetting = z.infer<typeof PlatformSettingSchema>;
