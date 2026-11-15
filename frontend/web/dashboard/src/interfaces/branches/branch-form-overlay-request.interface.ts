import type { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import type { Branch } from "@/types/branches/branch.type";

export interface BranchFormOverlayRequest {
  kind: OverlayKind.BranchForm;
  /** Present when editing an existing branch. */
  branch?: Branch;
}
