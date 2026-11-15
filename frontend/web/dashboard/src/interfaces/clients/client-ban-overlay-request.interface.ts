import type { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import type { AdminClient } from "@/types/clients/clients/admin-client.type";

export interface ClientBanOverlayRequest {
  kind: OverlayKind.ClientBan;
  client: AdminClient;
}
