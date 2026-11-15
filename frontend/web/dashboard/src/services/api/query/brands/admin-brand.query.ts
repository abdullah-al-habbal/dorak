import { DASHBOARD_API } from "@/config/routes.constant";
import { adminBrandSchema } from "@/schemas/brands/admin-brand.zod";
import { apiRequest } from "@/services/api/core/client";
import type { AdminBrand } from "@/types/brands/admin-brand.type";

export function fetchAdminBrand(id: string): Promise<AdminBrand> {
  return apiRequest(`${DASHBOARD_API}/brands/${encodeURIComponent(id)}`, { schema: adminBrandSchema });
}
