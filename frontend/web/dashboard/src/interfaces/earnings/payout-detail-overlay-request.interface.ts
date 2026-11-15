import type { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import type { AdminPayout } from "@/types/earnings/admin-payout.type";

export interface PayoutDetailOverlayRequest {
  kind: OverlayKind.PayoutDetail;
  payout: AdminPayout;
}
