import { z } from "zod";
import type { IPlatformSetting } from "@/services/api/dashboard/settings/types/iplatform-setting.types";
import type { IPlatformSettingsForm } from "@/services/api/dashboard/settings/types/iplatform-settings-form.types";

/** One integer field per setting, bounded by the min/max the backend reports. */
export function buildPlatformSettingsFormSchema(
  settings: IPlatformSetting[],
): z.ZodObject<Record<string, z.ZodString>> {
  const shape = Object.fromEntries(
    settings.map((setting) => [
      setting.key,
      z
        .string()
        .regex(/^\d+$/)
        .refine((text) => {
          const value = Number(text);
          return value >= setting.min && value <= setting.max;
        }),
    ]),
  );
  return z.object(shape);
}

export function platformSettingsFormDefaults(
  settings: IPlatformSetting[],
): IPlatformSettingsForm {
  return Object.fromEntries(
    settings.map((setting) => [setting.key, String(setting.value)]),
  );
}

/** Sends only the settings that differ from what the backend returned. */
export function platformSettingsPayload(
  form: IPlatformSettingsForm,
  settings: IPlatformSetting[],
): { settings: Record<string, number> } {
  const changed = settings.filter(
    (setting) => Number(form[setting.key]) !== setting.value,
  );
  return {
    settings: Object.fromEntries(
      changed.map((setting) => [setting.key, Number(form[setting.key])]),
    ),
  };
}
