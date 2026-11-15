import { PAYOUT_ACTIONS_BY_STATUS } from "@/config/payout.constant";
import type { PayoutAction } from "@/enums/payout-action.enum";
import type { PayoutStatus } from "@/enums/payout-status.enum";

export function availablePayoutActions(status: PayoutStatus): readonly PayoutAction[] {
  return PAYOUT_ACTIONS_BY_STATUS[status];
}
