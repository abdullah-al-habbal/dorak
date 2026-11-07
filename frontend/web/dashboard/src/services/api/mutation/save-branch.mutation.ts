import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/http-method.enum";
import type { BranchPayload } from "@/interfaces/branch-payload.interface";
import { branchDetailSchema } from "@/schemas/branch.zod";
import { apiRequest } from "@/services/api/core/client";
import type { BranchDetail } from "@/types/branch-detail.type";

const BRANCHES = `${DASHBOARD_API}/branches`;

export function createBranch(payload: BranchPayload): Promise<BranchDetail> {
  return apiRequest(BRANCHES, { method: HttpMethod.Post, body: payload, schema: branchDetailSchema });
}

export function updateBranch(id: string, payload: BranchPayload): Promise<BranchDetail> {
  return apiRequest(`${BRANCHES}/${encodeURIComponent(id)}`, { method: HttpMethod.Put, body: payload, schema: branchDetailSchema });
}
