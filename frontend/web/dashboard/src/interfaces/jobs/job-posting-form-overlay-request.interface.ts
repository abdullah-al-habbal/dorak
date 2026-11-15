import type { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import type { BranchJobPosting } from "@/types/jobs/branch-job-posting.type";

export interface JobPostingFormOverlayRequest {
  kind: OverlayKind.JobPostingForm;
  branchId: string;
  /** Present when editing. */
  posting?: BranchJobPosting;
}
