import type { BranchInvitation } from "@/types/branches/branch-invitation.type";
import type { PageInfo } from "@/types/core/page-info.type";

export interface InvitationPage {
  items: BranchInvitation[];
  page: PageInfo;
}
