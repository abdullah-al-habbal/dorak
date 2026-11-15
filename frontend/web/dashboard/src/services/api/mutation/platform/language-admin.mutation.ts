import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/access/http-method.enum";
import { adminLanguageSchema } from "@/schemas/platform/language-admin.zod";
import { apiRequest } from "@/services/api/core/client";
import type { AdminLanguage } from "@/types/platform/admin-language.type";

export function setLanguageActive(id: string, active: boolean): Promise<AdminLanguage> {
  return apiRequest(`${DASHBOARD_API}/admin/languages/${encodeURIComponent(id)}/active`, { method: HttpMethod.Patch, body: { is_active: active }, schema: adminLanguageSchema });
}
