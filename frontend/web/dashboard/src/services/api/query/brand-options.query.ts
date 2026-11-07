import { BRANCH_OPTIONS_LIMIT } from "@/config/branch.constant";
import { DASHBOARD_API } from "@/config/routes.constant";
import { brandOptionListSchema } from "@/schemas/branch.zod";
import { apiRequest } from "@/services/api/core/client";
import type { BrandOption } from "@/types/brand-option.type";

export function fetchBrandOptions(): Promise<BrandOption[]> {
  return apiRequest(`${DASHBOARD_API}/brands?per_page=${BRANCH_OPTIONS_LIMIT}`, { schema: brandOptionListSchema });
}
