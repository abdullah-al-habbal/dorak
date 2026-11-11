"use client";

import type { JSX } from "react";

import { PostingStatusBadge } from "@/components/jobs/job-status-badges";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/use-i18n";
import { localizedText } from "@/lib/booking-format.util";
import type { BranchJobPosting } from "@/types/branch-job-posting.type";

interface JobPostingRowProps {
  posting: BranchJobPosting;
  onApplications: (posting: BranchJobPosting) => void;
  onEdit: (posting: BranchJobPosting) => void;
}

/** One vacancy: its title, status and application count, with the two actions. */
export function JobPostingRow({ posting, onApplications, onEdit }: JobPostingRowProps): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { jobs: t } = dictionary;
  const type = posting.employment_type ? t.employmentType[posting.employment_type as keyof typeof t.employmentType] : null;
  const count = posting.applications_count ?? 0;

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 p-4">
      <div className="flex min-w-0 flex-col gap-1">
        <span dir="auto" className="truncate font-medium">{localizedText(posting.title, locale)}</span>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <PostingStatusBadge status={posting.status} />
          {type ? <span>{type}</span> : null}
          {posting.location ? <span dir="auto">{posting.location}</span> : null}
          <span className="tabular">{t.applicationCount.replace("{count}", String(count))}</span>
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={() => onApplications(posting)}>{t.viewApplications}</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => onEdit(posting)}>{t.edit}</Button>
      </div>
    </li>
  );
}
