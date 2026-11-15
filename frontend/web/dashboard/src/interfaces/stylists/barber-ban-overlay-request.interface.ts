import type { OverlayKind } from "@/enums/overlay-kind.enum";
import type { BarberApproval } from "@/types/stylists/barber-approval.type";

export interface BarberBanOverlayRequest {
  kind: OverlayKind.BarberBan;
  barber: BarberApproval;
}
