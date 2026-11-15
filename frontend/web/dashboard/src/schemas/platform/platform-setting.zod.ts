import { z } from "zod";

import { SettingGroup } from "@/enums/ui/setting-group.enum";

export const platformSettingSchema = z.object({
  setting_key: z.string(),
  group: z.enum(SettingGroup),
  value_integer: z.number().int(),
  default: z.number().int(),
  min: z.number().int(),
  max: z.number().int(),
});

export const platformSettingListSchema = z.array(platformSettingSchema);
/** `PATCH /admin/settings` answers with every effective value keyed by setting. */
export const platformSettingValuesSchema = z.record(z.string(), z.number());
