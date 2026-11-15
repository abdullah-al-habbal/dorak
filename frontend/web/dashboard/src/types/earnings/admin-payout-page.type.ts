import type { AdminPayout } from "@/types/earnings/admin-payout.type";
import type { PageInfo } from "@/types/core/shared/page-info.type";

export interface AdminPayoutPage {
  items: AdminPayout[];
  page: PageInfo;
}
