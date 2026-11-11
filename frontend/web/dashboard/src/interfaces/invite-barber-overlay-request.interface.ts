import type { OverlayKind } from "@/enums/overlay-kind.enum";

export interface InviteBarberOverlayRequest {
  kind: OverlayKind.InviteBarber;
  branchId: string;
}
