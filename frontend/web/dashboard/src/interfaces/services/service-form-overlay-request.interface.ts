import type { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import type { Service } from "@/types/services/service.type";

export interface ServiceFormOverlayRequest {
  kind: OverlayKind.ServiceForm;
  /** Present when editing. */
  service?: Service;
  /** The brand a new service belongs to. Unused when editing. */
  brandId: string | null;
}
