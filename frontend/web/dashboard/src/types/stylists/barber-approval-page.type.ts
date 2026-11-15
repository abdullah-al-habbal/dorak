import type { BarberApproval } from "@/types/stylists/barber-approval.type";
import type { PageInfo } from "@/types/core/page-info.type";

export interface BarberApprovalPage {
  items: BarberApproval[];
  page: PageInfo;
}
