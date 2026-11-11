import type { OverlayKind } from "@/enums/overlay-kind.enum";
import type { BranchJobPosting } from "@/types/branch-job-posting.type";

export interface JobPostingFormOverlayRequest {
  kind: OverlayKind.JobPostingForm;
  branchId: string;
  /** Present when editing. */
  posting?: BranchJobPosting;
}
