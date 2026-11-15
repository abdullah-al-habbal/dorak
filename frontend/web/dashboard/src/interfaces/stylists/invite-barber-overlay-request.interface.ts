import type { OverlayKind } from "@/enums/overlay-kind.enum";

export interface InviteBarberOverlayRequest {
  kind: OverlayKind.InviteBarber;
  branchId: string;
  /** Set when an accepted job applicant is invited, so the dialog skips the search. */
  barber?: { id: string; name: string };
}
