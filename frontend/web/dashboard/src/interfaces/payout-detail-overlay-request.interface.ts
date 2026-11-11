import type { OverlayKind } from "@/enums/overlay-kind.enum";
import type { AdminPayout } from "@/types/admin-payout.type";

export interface PayoutDetailOverlayRequest {
  kind: OverlayKind.PayoutDetail;
  payout: AdminPayout;
}
