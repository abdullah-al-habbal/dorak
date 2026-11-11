import type { BranchJobPosting } from "@/types/branch-job-posting.type";
import type { JobApplication } from "@/types/job-application.type";
import type { PageInfo } from "@/types/page-info.type";

export interface JobPostingPage {
  items: BranchJobPosting[];
  page: PageInfo;
}

export interface JobApplicationPage {
  items: JobApplication[];
  page: PageInfo;
}
