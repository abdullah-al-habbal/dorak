import { BRANCH_OPTIONS_LIMIT } from "@/config/branch.constant";
import { DASHBOARD_API } from "@/config/routes.constant";
import { adminBrandListSchema } from "@/schemas/brands/admin-brand.zod";
import { apiRequest } from "@/services/api/core/client";
import type { AdminBrand } from "@/types/brands/admin-brand.type";

/** The signed-in owner's own brands with their status (the backend scopes the list to the actor). */
export function fetchOwnerBrands(): Promise<AdminBrand[]> {
  return apiRequest(`${DASHBOARD_API}/brands?per_page=${BRANCH_OPTIONS_LIMIT}`, { schema: adminBrandListSchema });
}
