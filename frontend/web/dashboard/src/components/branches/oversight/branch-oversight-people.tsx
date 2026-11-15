"use client";

import type { JSX } from "react";

import { useBranchInvitations } from "@/hooks/branches/invitations/use-branch-invitations";
import { useBranchJobPostings } from "@/hooks/jobs/use-branch-job-postings";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { localizedText } from "@/lib/core/format/booking-format.util";

/** The branch's barber invitations and job postings, read-only. */
export function BranchOversightPeople({ branchId }: { branchId: string }): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { branchOversight: t } = dictionary;
  const invitations = useBranchInvitations(branchId);
  const jobs = useBranchJobPostings(branchId);
  const state = (value: string): string => (value in t.states ? t.states[value as keyof typeof t.states] : value);

  return (
    <>
      <section aria-label={t.invitations.title} className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">{t.invitations.title}</h3>
        {invitations.isError ? <p role="alert" className="text-sm text-destructive">{t.loadFailed}</p> : null}
        {invitations.data && invitations.data.length === 0 ? <p className="text-sm text-muted-foreground">{t.invitations.empty}</p> : null}
        <ul className="flex flex-col gap-1.5">
          {invitations.data?.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm">
              <span dir="auto" className="truncate">{localizedText(item.barber_name, locale) || t.none}</span>
              <span className="text-muted-foreground">{state(item.status)}</span>
            </li>
          ))}
        </ul>
      </section>
      <section aria-label={t.jobs.title} className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">{t.jobs.title}</h3>
        {jobs.isError ? <p role="alert" className="text-sm text-destructive">{t.loadFailed}</p> : null}
        {jobs.data && jobs.data.length === 0 ? <p className="text-sm text-muted-foreground">{t.jobs.empty}</p> : null}
        <ul className="flex flex-col gap-1.5">
          {jobs.data?.map((job) => (
            <li key={job.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm">
              <span dir="auto" className="truncate">{localizedText(job.title, locale)}</span>
              <span className="tabular text-muted-foreground">
                {state(job.status)}
                {job.applications_count === undefined ? "" : ` · ${t.jobs.applications.replace("{count}", String(job.applications_count))}`}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
