import { INVITATION_FILTER_ALL } from "@/config/invitation.constant";
import { DASHBOARD_API } from "@/config/routes.constant";
import { resolvePageInfo } from "@/lib/resolve-page-info.util";
import { branchInvitationListSchema } from "@/schemas/branch-oversight.zod";
import { apiRequestWithMeta } from "@/services/api/core/client";
import type { InvitationPage } from "@/types/branches/invitation-page.type";

/** The backend sets the page size from the platform pagination setting. */
const ASSUMED_PER_PAGE = 15;

export async function fetchInvitationPage(branchId: string, status: string, page: number): Promise<InvitationPage> {
  const params = new URLSearchParams({ page: String(page) });
  if (status !== INVITATION_FILTER_ALL) params.set("status", status);
  const { data, meta } = await apiRequestWithMeta(`${DASHBOARD_API}/branches/${encodeURIComponent(branchId)}/affiliations?${params.toString()}`, { schema: branchInvitationListSchema });
  return { items: data, page: resolvePageInfo(meta, data.length, ASSUMED_PER_PAGE, page) };
}
