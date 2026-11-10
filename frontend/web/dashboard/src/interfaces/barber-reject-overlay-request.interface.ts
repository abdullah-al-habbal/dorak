import type { OverlayKind } from "@/enums/overlay-kind.enum";
import type { BarberApproval } from "@/types/barber-approval.type";

export interface BarberRejectOverlayRequest {
  kind: OverlayKind.BarberReject;
  barber: BarberApproval;
}
