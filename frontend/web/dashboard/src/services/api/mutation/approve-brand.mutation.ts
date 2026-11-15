import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/http-method.enum";
import { adminBrandSchema } from "@/schemas/admin-brand.zod";
import { apiRequest } from "@/services/api/core/client";
import type { AdminBrand } from "@/types/brands/admin-brand.type";

export function approveBrand(id: string): Promise<AdminBrand> {
  return apiRequest(`${DASHBOARD_API}/admin/brands/${encodeURIComponent(id)}/approve`, { method: HttpMethod.Patch, schema: adminBrandSchema });
}
