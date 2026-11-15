import { z } from "zod";

import { settingIssues } from "@/lib/platform/platform-settings.util";
import type { SettingFormValues } from "@/lib/platform/platform-settings.util";
import type { Dictionary } from "@/types/core/dictionary.type";
import type { PlatformSetting } from "@/types/platform/platform-setting.type";

type SettingsValidation = Dictionary["settings"]["validation"];

/** Mirrors `UpdatePlatformSettingsRequest`: every field an integer inside the backend's own bounds, plus the two cross-field rules. */
export function createPlatformSettingsSchema(settings: readonly PlatformSetting[], messages: SettingsValidation) {
  return z.record(z.string(), z.string()).superRefine((values: SettingFormValues, context) => {
    const bounds = new Map(settings.map((setting) => [setting.setting_key, setting]));
    for (const issue of settingIssues(values, settings)) {
      const setting = bounds.get(issue.name);
      const message = {
        integer: messages.integer,
        range: messages.range.replace("{min}", String(setting?.min ?? "")).replace("{max}", String(setting?.max ?? "")),
        pageSize: messages.pageSize,
        refreshTtl: messages.refreshTtl,
      }[issue.kind];
      context.addIssue({ code: "custom", path: [issue.name], message });
    }
  });
}
