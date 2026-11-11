import type { OverlayKind } from "@/enums/overlay-kind.enum";
import type { PaymentGateway } from "@/types/payment-gateway.type";

export interface PaymentGatewayOverlayRequest {
  kind: OverlayKind.PaymentGatewayForm;
  /** Present when editing. */
  gateway?: PaymentGateway;
}
