import { DASHBOARD_API } from "@/config/routes.constant";
import { adminBrandSchema } from "@/schemas/admin-brand.zod";
import { apiRequest } from "@/services/api/core/client";
import type { AdminBrand } from "@/types/admin-brand.type";

export function fetchAdminBrand(id: string): Promise<AdminBrand> {
  return apiRequest(`${DASHBOARD_API}/brands/${encodeURIComponent(id)}`, { schema: adminBrandSchema });
}
