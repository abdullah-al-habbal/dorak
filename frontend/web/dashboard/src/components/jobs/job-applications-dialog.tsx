"use client";

import { useState } from "react";
import type { JSX } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { ApplicationRow } from "@/components/jobs/application-row";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PaginationBar } from "@/components/ui/table/pagination-bar";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { ApplicationStatus } from "@/enums/booking/application-status.enum";
import { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { useJobApplications } from "@/hooks/jobs/use-job-applications";
import { useMarkApplicationsSeen } from "@/hooks/jobs/use-mark-applications-seen";
import { useOverlay } from "@/hooks/core/state/use-overlay";
import { useUpdateApplicationStatus } from "@/hooks/jobs/use-update-application-status";
import { localizedText } from "@/lib/core/format/booking-format.util";
import type { BranchJobPosting } from "@/types/jobs/branch-job-posting.type";
import type { JobApplication } from "@/types/jobs/job-application.type";

const FIRST_PAGE = 1;

interface JobApplicationsDialogProps {
  branchId: string;
  posting: BranchJobPosting;
  onClose: () => void;
}

/** The applications for one vacancy. Accepting leads on to inviting the barber (NS-16). */
export function JobApplicationsDialog({ branchId, posting, onClose }: JobApplicationsDialogProps): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { jobs: t } = dictionary;
  const overlay = useOverlay();
  const update = useUpdateApplicationStatus();
  const markSeen = useMarkApplicationsSeen();
  const [page, setPage] = useState(FIRST_PAGE);
  const query = useJobApplications(branchId, posting.id, page);
  const items = query.data?.items ?? [];

  const hasNew = items.some((application) => application.status === ApplicationStatus.Submitted);

  function changeStatus(application: JobApplication, status: ApplicationStatus): void {
    update.mutate({ branchId, postingId: posting.id, id: application.id, status });
  }

  function invite(application: JobApplication): void {
    const name = localizedText(application.profile_snapshot?.name, locale) || t.unknownApplicant;
    overlay.open({ kind: OverlayKind.InviteBarber, branchId, barber: { id: application.barber_id, name } });
  }

  return (
    <Dialog open onOpenChange={(open) => (open ? undefined : onClose())}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle dir="auto">{localizedText(posting.title, locale)}</DialogTitle>
          <DialogDescription>{t.applicationsDescription}</DialogDescription>
        </DialogHeader>
        <div aria-busy={query.isFetching} className="flex flex-col gap-4">
          {query.isPending ? <TableSkeleton /> : null}
          {query.isError ? <ErrorState title={t.applicationStates.errorTitle} body={t.applicationStates.errorBody} onRetry={() => query.refetch()} /> : null}
          {query.data && items.length === 0 ? <EmptyState title={t.applicationStates.emptyTitle} body={t.applicationStates.emptyBody} /> : null}
          {items.length > 0 ? (
            <>
              {hasNew ? (
                <div>
                  <Button type="button" size="sm" variant="outline" disabled={markSeen.isPending} onClick={() => markSeen.mutate({ branchId, postingId: posting.id })}>{t.action.markAllSeen}</Button>
                </div>
              ) : null}
              <ul aria-label={t.applications} className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
                {items.map((application) => (
                  <ApplicationRow key={application.id} application={application} busy={update.isPending} onStatus={changeStatus} onInvite={invite} />
                ))}
              </ul>
              {query.data ? <PaginationBar page={query.data.page.current_page} totalPages={query.data.page.total_pages} label={t.applications} onPageChange={setPage} /> : null}
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
