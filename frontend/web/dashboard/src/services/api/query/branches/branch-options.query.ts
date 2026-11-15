import { BRANCH_OPTIONS_PER_PAGE } from "@/config/working-hours.constant";
import { DASHBOARD_API } from "@/config/routes.constant";
import { branchOptionListSchema } from "@/schemas/branches/branch-option.zod";
import { apiRequest } from "@/services/api/core/client";
import type { BranchOption } from "@/types/branches/branch-option.type";

export function fetchBranchOptions(): Promise<BranchOption[]> {
  return apiRequest(`${DASHBOARD_API}/branches?per_page=${BRANCH_OPTIONS_PER_PAGE}`, { schema: branchOptionListSchema });
}
