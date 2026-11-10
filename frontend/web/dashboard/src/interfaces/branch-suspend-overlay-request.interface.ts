import type { OverlayKind } from "@/enums/overlay-kind.enum";
import type { Branch } from "@/types/branch.type";

export interface BranchSuspendOverlayRequest {
  kind: OverlayKind.BranchSuspend;
  branch: Branch;
}
