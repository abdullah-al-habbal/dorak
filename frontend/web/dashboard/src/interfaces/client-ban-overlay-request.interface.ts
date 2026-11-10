import type { OverlayKind } from "@/enums/overlay-kind.enum";
import type { AdminClient } from "@/types/admin-client.type";

export interface ClientBanOverlayRequest {
  kind: OverlayKind.ClientBan;
  client: AdminClient;
}
