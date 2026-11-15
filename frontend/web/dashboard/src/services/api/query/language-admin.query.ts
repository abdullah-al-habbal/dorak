import { DASHBOARD_API } from "@/config/routes.constant";
import { adminLanguageListSchema } from "@/schemas/platform/language-admin.zod";
import { apiRequest } from "@/services/api/core/client";
import type { AdminLanguage } from "@/types/platform/admin-language.type";

export function fetchAdminLanguages(): Promise<AdminLanguage[]> {
  return apiRequest(`${DASHBOARD_API}/admin/languages`, { schema: adminLanguageListSchema });
}
