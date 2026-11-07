import type { PageInfo } from "@/types/page-info.type";
import type { Payout } from "@/types/payout.type";

export interface PayoutPage {
  items: Payout[];
  page: PageInfo;
}
