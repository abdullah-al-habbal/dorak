import type { OverlayKind } from "@/enums/overlay-kind.enum";
import type { BarberApproval } from "@/types/barber-approval.type";

export interface BarberBanOverlayRequest {
  kind: OverlayKind.BarberBan;
  barber: BarberApproval;
}
