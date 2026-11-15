"use client";

import type { JSX } from "react";

import { ApplicationStatusBadge } from "@/components/jobs/job-status-badges";
import { Button } from "@/components/ui/button";
import { ApplicationStatus } from "@/enums/application-status.enum";
import { useI18n } from "@/hooks/use-i18n";
import { localizedText } from "@/lib/booking-format.util";
import type { JobApplication } from "@/types/jobs/job-application.type";

interface ApplicationRowProps {
  application: JobApplication;
  busy: boolean;
  onStatus: (application: JobApplication, status: ApplicationStatus) => void;
  onInvite: (application: JobApplication) => void;
}

/** One applicant: the profile they applied with, and the next moves. An accepted applicant can be invited to the branch. */
export function ApplicationRow({ application, busy, onStatus, onInvite }: ApplicationRowProps): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { jobs: t } = dictionary;
  const profile = application.profile_snapshot;
  const rating = profile?.rating?.average;
  const accepted = application.status === ApplicationStatus.Accepted;
  const rejected = application.status === ApplicationStatus.Rejected;
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(application.created_at));

  return (
    <li className="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <span dir="auto" className="truncate font-medium">{localizedText(profile?.name, locale) || t.unknownApplicant}</span>
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <ApplicationStatusBadge status={application.status} />
            {rating !== null && rating !== undefined ? <span className="tabular">{t.rating.replace("{value}", rating.toFixed(1))}</span> : null}
            <time dateTime={application.created_at} className="tabular">{date}</time>
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {accepted ? <Button type="button" size="sm" disabled={busy} onClick={() => onInvite(application)}>{t.inviteApplicant}</Button> : null}
          {!accepted ? <Button type="button" size="sm" disabled={busy} onClick={() => onStatus(application, ApplicationStatus.Accepted)}>{t.action.accept}</Button> : null}
          {!rejected ? <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => onStatus(application, ApplicationStatus.Rejected)}>{t.action.reject}</Button> : null}
        </div>
      </div>
      {profile?.bio ? <p dir="auto" className="line-clamp-3 text-sm text-muted-foreground">{localizedText(profile.bio, locale)}</p> : null}
    </li>
  );
}
