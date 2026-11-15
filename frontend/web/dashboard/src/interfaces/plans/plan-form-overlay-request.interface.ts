import type { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import type { Plan } from "@/types/plans/plan.type";

export interface PlanFormOverlayRequest {
  kind: OverlayKind.PlanForm;
  /** Present when editing an existing plan. */
  plan?: Plan;
}
