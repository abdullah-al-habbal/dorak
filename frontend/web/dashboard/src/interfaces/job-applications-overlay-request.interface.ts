import type { OverlayKind } from "@/enums/overlay-kind.enum";
import type { BranchJobPosting } from "@/types/branch-job-posting.type";

export interface JobApplicationsOverlayRequest {
  kind: OverlayKind.JobApplications;
  branchId: string;
  posting: BranchJobPosting;
}
