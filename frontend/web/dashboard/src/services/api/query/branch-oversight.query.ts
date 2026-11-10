import { DASHBOARD_API } from "@/config/routes.constant";
import { branchInvitationListSchema, branchJobPostingListSchema } from "@/schemas/branch-oversight.zod";
import { apiRequest } from "@/services/api/core/client";
import type { BranchInvitation } from "@/types/branch-invitation.type";
import type { BranchJobPosting } from "@/types/branch-job-posting.type";

function branchPath(id: string): string {
  return `${DASHBOARD_API}/branches/${encodeURIComponent(id)}`;
}

/** The first page only: the admin reads the latest, and NS-16/NS-17 give the branch teams the full screens. */
export function fetchBranchInvitations(id: string): Promise<BranchInvitation[]> {
  return apiRequest(`${branchPath(id)}/affiliations`, { schema: branchInvitationListSchema });
}

export function fetchBranchJobPostings(id: string): Promise<BranchJobPosting[]> {
  return apiRequest(`${branchPath(id)}/job-postings`, { schema: branchJobPostingListSchema });
}
