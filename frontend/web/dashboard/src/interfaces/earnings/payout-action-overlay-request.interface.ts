import type { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import type { PayoutAction } from "@/enums/money/payout-action.enum";
import type { AdminPayout } from "@/types/earnings/admin-payout.type";

export interface PayoutActionOverlayRequest {
  kind: OverlayKind.PayoutAction;
  payout: AdminPayout;
  action: PayoutAction;
}
