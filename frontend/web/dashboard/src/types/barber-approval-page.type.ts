import type { BarberApproval } from "@/types/barber-approval.type";
import type { PageInfo } from "@/types/page-info.type";

export interface BarberApprovalPage {
  items: BarberApproval[];
  page: PageInfo;
}
