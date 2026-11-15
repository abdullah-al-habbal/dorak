import type { PayoutStatus } from "@/enums/payout-status.enum";

export interface PayoutFilters {
  status?: PayoutStatus;
  page: number;
}
