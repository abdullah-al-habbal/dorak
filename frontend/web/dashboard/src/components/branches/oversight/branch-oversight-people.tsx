"use client";

import { useState } from "react";
import type { JSX } from "react";

import { PaginationBar } from "@/components/ui/table/pagination-bar";
import { INVITATION_FILTER_ALL } from "@/config/ops/invitation.constant";
import { useInvitations } from "@/hooks/branches/invitations/use-invitations";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { useJobPostings } from "@/hooks/jobs/use-job-postings";
import { localizedText } from "@/lib/core/format/booking-format.util";
import { enumLabel } from "@/lib/core/format/enum-label.util";

const FIRST_PAGE = 1;

/** The branch's barber invitations and job postings, read-only and paged. */
export function BranchOversightPeople({ branchId }: { branchId: string }): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { branchOversight: t } = dictionary;
  const [invitationPage, setInvitationPage] = useState(FIRST_PAGE);
  const [jobPage, setJobPage] = useState(FIRST_PAGE);
  const invitations = useInvitations(branchId, INVITATION_FILTER_ALL, invitationPage);
  const jobs = useJobPostings(branchId, jobPage);
  const state = (value: string): string => enumLabel(t.states, value, dictionary.common.unknown, "branch-oversight-state");

  return (
    <>
      <section aria-label={t.invitations.title} className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">{t.invitations.title}</h3>
        {invitations.isError ? <p role="alert" className="text-sm text-destructive">{t.loadFailed}</p> : null}
        {invitations.data && invitations.data.items.length === 0 ? <p className="text-sm text-muted-foreground">{t.invitations.empty}</p> : null}
        <ul className="flex flex-col gap-1.5">
          {invitations.data?.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm">
              <span dir="auto" className="truncate">{localizedText(item.barber_name, locale) || t.none}</span>
              <span className="text-muted-foreground">{state(item.status)}</span>
            </li>
          ))}
        </ul>
        {invitations.data ? <PaginationBar page={invitations.data.page.current_page} totalPages={invitations.data.page.total_pages} label={t.invitations.title} onPageChange={setInvitationPage} /> : null}
      </section>
      <section aria-label={t.jobs.title} className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">{t.jobs.title}</h3>
        {jobs.isError ? <p role="alert" className="text-sm text-destructive">{t.loadFailed}</p> : null}
        {jobs.data && jobs.data.items.length === 0 ? <p className="text-sm text-muted-foreground">{t.jobs.empty}</p> : null}
        <ul className="flex flex-col gap-1.5">
          {jobs.data?.items.map((job) => (
            <li key={job.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm">
              <span dir="auto" className="truncate">{localizedText(job.title, locale)}</span>
              <span className="tabular text-muted-foreground">
                {state(job.status)}
                {job.applications_count === undefined ? "" : ` · ${t.jobs.applications.replace("{count}", String(job.applications_count))}`}
              </span>
            </li>
          ))}
        </ul>
        {jobs.data ? <PaginationBar page={jobs.data.page.current_page} totalPages={jobs.data.page.total_pages} label={t.jobs.title} onPageChange={setJobPage} /> : null}
      </section>
    </>
  );
}
