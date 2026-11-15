import type { OverlayKind } from "@/enums/overlay-kind.enum";
import type { Branch } from "@/types/branches/branch.type";

export interface BranchOversightOverlayRequest {
  kind: OverlayKind.BranchOversight;
  branch: Branch;
}
