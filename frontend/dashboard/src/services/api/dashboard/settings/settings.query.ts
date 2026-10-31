import { api } from "@/services/api/core/client";
import { DashboardEndpoints } from "@/services/api/dashboard/endpoints/dashboard.endpoints";
import { PlatformSettingsListSchema } from "@/services/api/dashboard/settings/schemas/settings.schema";
import { platformSettingsPayload } from "@/services/api/dashboard/settings/settings.util";
import type { IPlatformSetting } from "@/services/api/dashboard/settings/types/iplatform-setting.types";
import type { IPlatformSettingsForm } from "@/services/api/dashboard/settings/types/iplatform-settings-form.types";

export async function getPlatformSettings(): Promise<IPlatformSetting[]> {
  const result = await api.get<unknown>(DashboardEndpoints.adminSettings);
  return PlatformSettingsListSchema.parse(result);
}

export const savePlatformSettings = (input: {
  form: IPlatformSettingsForm;
  settings: IPlatformSetting[];
}) =>
  api.patch<unknown>(
    DashboardEndpoints.adminSettings,
    platformSettingsPayload(input.form, input.settings),
  );
