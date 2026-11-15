import type { PageInfo } from "@/types/core/shared/page-info.type";
import type { Payout } from "@/types/earnings/payout.type";

export interface PayoutPage {
  items: Payout[];
  page: PageInfo;
}
