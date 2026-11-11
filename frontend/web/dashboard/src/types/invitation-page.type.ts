import type { BranchInvitation } from "@/types/branch-invitation.type";
import type { PageInfo } from "@/types/page-info.type";

export interface InvitationPage {
  items: BranchInvitation[];
  page: PageInfo;
}
