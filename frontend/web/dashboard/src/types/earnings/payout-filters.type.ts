import type { PayoutStatus } from "@/enums/money/payout-status.enum";

export interface PayoutFilters {
  status?: PayoutStatus;
  page: number;
}
