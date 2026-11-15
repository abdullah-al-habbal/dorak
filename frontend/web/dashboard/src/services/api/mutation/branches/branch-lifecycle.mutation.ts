import { DASHBOARD_API } from "@/config/routes.constant";
import { BranchLifecycleAction } from "@/enums/venue/branch-lifecycle-action.enum";
import { HttpMethod } from "@/enums/access/http-method.enum";
import type { BranchLifecyclePayload } from "@/interfaces/branches/branch-lifecycle-payload.interface";
import { branchSchema } from "@/schemas/branches/branch.zod";
import { apiRequest } from "@/services/api/core/client";
import type { Branch } from "@/types/branches/branch.type";

/** Switch on/off use `/branches/{id}/…`; suspend and reactivate are admin routes under `/admin/branches/{id}/…`. */
export function transitionBranch({ id, action, reason }: BranchLifecyclePayload): Promise<Branch> {
  const admin = action === BranchLifecycleAction.Suspend || action === BranchLifecycleAction.Reactivate;
  const prefix = admin ? `${DASHBOARD_API}/admin/branches` : `${DASHBOARD_API}/branches`;
  return apiRequest(`${prefix}/${encodeURIComponent(id)}/${action}`, { method: HttpMethod.Patch, body: reason === undefined ? undefined : { reason }, schema: branchSchema });
}
