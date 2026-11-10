import type { OverlayKind } from "@/enums/overlay-kind.enum";
import type { AdminClient } from "@/types/admin-client.type";

export interface ClientDetailOverlayRequest {
  kind: OverlayKind.ClientDetail;
  client: AdminClient;
}
