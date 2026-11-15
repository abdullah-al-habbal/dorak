import type { BranchLifecycleAction } from "@/enums/venue/branch-lifecycle-action.enum";

export interface BranchLifecyclePayload {
  id: string;
  action: BranchLifecycleAction;
  reason?: string;
}
