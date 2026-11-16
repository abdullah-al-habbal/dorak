import { DASHBOARD_API } from "@/config/routes.constant";
import { resolvePageInfo } from "@/lib/core/query/resolve-page-info.util";
import { branchJobPostingListSchema } from "@/schemas/branches/branch-oversight.zod";
import { jobApplicationListSchema } from "@/schemas/jobs/job-application.zod";
import { apiRequestWithMeta } from "@/services/api/core/client";
import type { JobApplicationPage, JobPostingPage } from "@/types/jobs/job-board-page.type";

/** The backend sets the page size from the platform pagination setting. */
const ASSUMED_PER_PAGE = 15;

function postingsPath(branchId: string): string {
  return `${DASHBOARD_API}/branches/${encodeURIComponent(branchId)}/job-postings`;
}

export async function fetchJobPostingPage(branchId: string, page: number): Promise<JobPostingPage> {
  const { data, meta } = await apiRequestWithMeta(`${postingsPath(branchId)}?page=${page}`, { schema: branchJobPostingListSchema });
  return { items: data, page: resolvePageInfo(meta, data.length, ASSUMED_PER_PAGE, page) };
}

/** A pure read: the new applications are marked as seen by the manager through a separate call (`markApplicationsSeen`). */
export async function fetchJobApplicationPage(branchId: string, postingId: string, page: number): Promise<JobApplicationPage> {
  const { data, meta } = await apiRequestWithMeta(`${postingsPath(branchId)}/${encodeURIComponent(postingId)}/applications?page=${page}`, { schema: jobApplicationListSchema });
  return { items: data, page: resolvePageInfo(meta, data.length, ASSUMED_PER_PAGE, page) };
}
