import { BRANCH_OPTIONS_LIMIT } from "@/config/branch.constant";
import { DASHBOARD_API } from "@/config/routes.constant";
import type { BrandStatus } from "@/enums/brand-status.enum";
import { brandOptionListSchema } from "@/schemas/branches/branch.zod";
import { apiRequest } from "@/services/api/core/client";
import type { BrandOption } from "@/types/brands/brand-option.type";

/** The brands the actor can see; with a status, only those (the backend filters after scoping to the actor). */
export function fetchBrandOptions(status?: BrandStatus): Promise<BrandOption[]> {
  const params = new URLSearchParams({ per_page: String(BRANCH_OPTIONS_LIMIT) });
  if (status) params.set("status", status);
  return apiRequest(`${DASHBOARD_API}/brands?${params.toString()}`, { schema: brandOptionListSchema });
}
