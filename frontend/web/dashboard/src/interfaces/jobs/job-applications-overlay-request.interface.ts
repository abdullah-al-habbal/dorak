import type { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import type { BranchJobPosting } from "@/types/jobs/branch-job-posting.type";

export interface JobApplicationsOverlayRequest {
  kind: OverlayKind.JobApplications;
  branchId: string;
  posting: BranchJobPosting;
}
