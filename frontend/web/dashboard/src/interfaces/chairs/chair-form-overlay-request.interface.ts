import type { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import type { Chair } from "@/types/chairs/chair.type";

export interface ChairFormOverlayRequest {
  kind: OverlayKind.ChairForm;
  /** Present when editing an existing chair. */
  chair?: Chair;
}
