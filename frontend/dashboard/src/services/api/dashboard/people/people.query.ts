import { api } from "@/services/api/core/client";
import { DashboardEndpoints } from "@/services/api/dashboard/endpoints/dashboard.endpoints";
import {
  mapAffiliation,
  mapApplication,
  mapJobPosting,
} from "@/services/api/dashboard/people/people.mapper.util";
import type {
  IAffiliation,
  IApplication,
  IInviteAffiliation,
  IJobPosting,
  IJobPostingForm,
} from "@/services/api/dashboard/people/types/ipeople.types";
import type { IDashboardPage } from "@/services/api/dashboard/shared/types/idashboard-page.types";

export const affiliationsQueryKey = (
  branchId: string,
  status: string,
  page: number,
) => ["dashboard", "affiliations", branchId, status, page] as const;
export const jobPostingsQueryKey = (branchId: string, page: number) =>
  ["dashboard", "job-postings", branchId, page] as const;
export const applicationsQueryKey = (postingId: string, page: number) =>
  ["dashboard", "job-postings", postingId, "applications", page] as const;

async function mappedPage<TItem>(
  request: Promise<IDashboardPage<unknown>>,
  map: (wire: unknown) => TItem,
): Promise<IDashboardPage<TItem>> {
  const result = await request;
  return { ...result, items: result.items.map(map) };
}

export function getAffiliations(
  branchId: string,
  status: string,
  page: number,
): Promise<IDashboardPage<IAffiliation>> {
  const query = new URLSearchParams({ page: String(page) });
  if (status !== "") query.set("status", status);
  return mappedPage(
    api.get(`${DashboardEndpoints.branchAffiliations(branchId)}?${query}`),
    mapAffiliation,
  );
}

export function respondToAffiliation(
  branchId: string,
  affiliationId: string,
  action: "accept" | "reject" | "terminate",
) {
  return api.post<unknown>(
    DashboardEndpoints.branchAffiliationAction(branchId, affiliationId, action),
  );
}

export function inviteBarber(branchId: string, invite: IInviteAffiliation) {
  return api.post<unknown>(DashboardEndpoints.branchAffiliations(branchId), {
    barber_id: invite.barberId,
    ...(invite.commissionRate === null
      ? {}
      : { commission_rate: invite.commissionRate }),
  });
}

export function getJobPostings(
  branchId: string,
  page: number,
): Promise<IDashboardPage<IJobPosting>> {
  return mappedPage(
    api.get(`${DashboardEndpoints.branchJobPostings(branchId)}?page=${page}`),
    mapJobPosting,
  );
}

export function jobPostingPayload(form: IJobPostingForm) {
  return {
    title: { en: form.titleEn, ar: form.titleAr },
    description: { en: form.descriptionEn, ar: form.descriptionAr },
    location: form.location === "" ? null : form.location,
    type: form.type === "" ? null : form.type,
  };
}

export function createJobPosting(branchId: string, form: IJobPostingForm) {
  return api.post<unknown>(
    DashboardEndpoints.branchJobPostings(branchId),
    jobPostingPayload(form),
  );
}

export function updateJobPosting(
  branchId: string,
  postingId: string,
  form: IJobPostingForm,
) {
  return api.put<unknown>(
    DashboardEndpoints.branchJobPosting(branchId, postingId),
    { ...jobPostingPayload(form), status: form.status },
  );
}

export function deleteJobPosting(branchId: string, postingId: string) {
  return api.delete<unknown>(
    DashboardEndpoints.branchJobPosting(branchId, postingId),
  );
}

export function getApplications(
  branchId: string,
  postingId: string,
  page: number,
): Promise<IDashboardPage<IApplication>> {
  return mappedPage(
    api.get(
      `${DashboardEndpoints.branchApplications(branchId, postingId)}?page=${page}`,
    ),
    mapApplication,
  );
}

export function setApplicationStatus(
  branchId: string,
  postingId: string,
  applicationId: string,
  status: "accepted" | "rejected",
) {
  return api.patch<unknown>(
    DashboardEndpoints.branchApplicationStatus(
      branchId,
      postingId,
      applicationId,
    ),
    { status },
  );
}
