import { DASHBOARD_API } from "@/config/routes.constant";
import { platformSettingListSchema } from "@/schemas/platform-setting.zod";
import { apiRequest } from "@/services/api/core/client";
import type { PlatformSetting } from "@/types/platform/platform-setting.type";

export async function fetchPlatformSettings(): Promise<PlatformSetting[]> {
  return apiRequest(`${DASHBOARD_API}/admin/settings`, { schema: platformSettingListSchema });
}
