import { z } from "zod";

import { DASHBOARD_API } from "@/config/routes.constant";
import { HttpMethod } from "@/enums/http-method.enum";
import { branchJobPostingSchema } from "@/schemas/branch-oversight.zod";
import { jobApplicationSchema } from "@/schemas/job-application.zod";
import { apiRequest } from "@/services/api/core/client";
import type { BranchJobPosting } from "@/types/jobs/branch-job-posting.type";
import type { JobApplication } from "@/types/jobs/job-application.type";

type Translated = { en: string; ar: string };

export interface JobPostingBody {
  title: Translated;
  description: Translated;
  requirements: Translated | null;
  location: string | null;
  employment_type: string | null;
  /** Sent only when editing: closing or reopening a posting. */
  status?: string;
}

/** The branch travels with the body because the save primitive passes one payload. */
export interface JobPostingInput {
  branchId: string;
  body: JobPostingBody;
}

function postingsPath(branchId: string): string {
  return `${DASHBOARD_API}/branches/${encodeURIComponent(branchId)}/job-postings`;
}

export function createJobPosting({ branchId, body }: JobPostingInput): Promise<BranchJobPosting> {
  return apiRequest(postingsPath(branchId), { method: HttpMethod.Post, body, schema: branchJobPostingSchema });
}

export function updateJobPosting(id: string, { branchId, body }: JobPostingInput): Promise<BranchJobPosting> {
  return apiRequest(`${postingsPath(branchId)}/${encodeURIComponent(id)}`, { method: HttpMethod.Put, body, schema: branchJobPostingSchema });
}

export async function deleteJobPosting(branchId: string, id: string): Promise<void> {
  await apiRequest(`${postingsPath(branchId)}/${encodeURIComponent(id)}`, { method: HttpMethod.Delete, schema: z.unknown() });
}

export function updateApplicationStatus(branchId: string, postingId: string, id: string, status: string): Promise<JobApplication> {
  return apiRequest(`${postingsPath(branchId)}/${encodeURIComponent(postingId)}/applications/${encodeURIComponent(id)}/status`, { method: HttpMethod.Patch, body: { status }, schema: jobApplicationSchema });
}

export interface MarkApplicationsSeenVariables {
  branchId: string;
  postingId: string;
}

/** Opening a vacancy's applications is a read; marking the new ones as seen is this explicit call. */
export async function markApplicationsSeen({ branchId, postingId }: MarkApplicationsSeenVariables): Promise<void> {
  await apiRequest(`${postingsPath(branchId)}/${encodeURIComponent(postingId)}/applications/mark-seen`, { method: HttpMethod.Post, schema: z.unknown() });
}
