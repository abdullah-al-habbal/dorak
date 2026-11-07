import type { OverlayKind } from "@/enums/overlay-kind.enum";
import type { Plan } from "@/types/plan.type";

export interface PlanFormOverlayRequest {
  kind: OverlayKind.PlanForm;
  /** Present when editing an existing plan. */
  plan?: Plan;
}
