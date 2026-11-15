import type { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import type { CommissionRule } from "@/types/earnings/commission.type";

export interface CommissionRuleOverlayRequest {
  kind: OverlayKind.CommissionRuleForm;
  /** Present when editing. */
  rule?: CommissionRule;
}
