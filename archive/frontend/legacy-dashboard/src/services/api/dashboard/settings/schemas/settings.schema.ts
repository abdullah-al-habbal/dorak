import { z } from "zod";
import {
  PLATFORM_SETTING_GROUPS,
  PLATFORM_SETTING_KEYS,
} from "@/services/api/dashboard/settings/settings.constant";

export const PlatformSettingSchema = z.object({
  settingKey: z.enum(PLATFORM_SETTING_KEYS),
  group: z.enum(PLATFORM_SETTING_GROUPS),
  valueInteger: z.number(),
  default: z.number(),
  min: z.number(),
  max: z.number(),
});

export const PlatformSettingsListSchema = z.array(PlatformSettingSchema);
