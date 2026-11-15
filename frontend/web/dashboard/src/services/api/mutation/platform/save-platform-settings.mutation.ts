import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/access/http-method.enum";
import { platformSettingValuesSchema } from "@/schemas/platform/platform-setting.zod";
import { apiRequest } from "@/services/api/core/client";

/** Sends only the settings that changed; the backend validates each against its own bounds. */
export function savePlatformSettings(settings: Record<string, number>): Promise<Record<string, number>> {
  return apiRequest(`${DASHBOARD_API}/admin/settings`, { method: HttpMethod.Patch, body: { settings }, schema: platformSettingValuesSchema });
}
