import type { AdminPayout } from "@/types/admin-payout.type";
import type { PageInfo } from "@/types/page-info.type";

export interface AdminPayoutPage {
  items: AdminPayout[];
  page: PageInfo;
}
