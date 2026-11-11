import type { OverlayKind } from "@/enums/overlay-kind.enum";
import type { CommissionRule } from "@/types/commission.type";

export interface CommissionRuleOverlayRequest {
  kind: OverlayKind.CommissionRuleForm;
  /** Present when editing. */
  rule?: CommissionRule;
}
