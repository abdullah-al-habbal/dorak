import { DASHBOARD_API } from "@/config/routes.constant";
import { branchDetailSchema } from "@/schemas/branches/branch.zod";
import { apiRequest } from "@/services/api/core/client";
import type { BranchDetail } from "@/types/branches/branch-detail.type";

export function fetchBranchDetail(id: string): Promise<BranchDetail> {
  return apiRequest(`${DASHBOARD_API}/branches/${encodeURIComponent(id)}`, { schema: branchDetailSchema });
}
