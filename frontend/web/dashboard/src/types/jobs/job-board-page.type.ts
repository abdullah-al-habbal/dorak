import type { BranchJobPosting } from "@/types/jobs/branch-job-posting.type";
import type { JobApplication } from "@/types/jobs/job-application.type";
import type { PageInfo } from "@/types/core/page-info.type";

export interface JobPostingPage {
  items: BranchJobPosting[];
  page: PageInfo;
}

export interface JobApplicationPage {
  items: JobApplication[];
  page: PageInfo;
}
