import type { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import type { PaymentGateway } from "@/types/platform/payment-gateway.type";

export interface PaymentGatewayOverlayRequest {
  kind: OverlayKind.PaymentGatewayForm;
  /** Present when editing. */
  gateway?: PaymentGateway;
}
