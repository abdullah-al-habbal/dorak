import { PAYOUT_ACTIONS_BY_STATUS } from "@/config/money-shell/payout.constant";
import type { PayoutAction } from "@/enums/money/payout-action.enum";
import type { PayoutStatus } from "@/enums/money/payout-status.enum";

export function availablePayoutActions(status: PayoutStatus): readonly PayoutAction[] {
  return PAYOUT_ACTIONS_BY_STATUS[status];
}
