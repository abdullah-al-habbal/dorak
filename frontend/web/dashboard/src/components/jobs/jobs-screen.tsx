"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";
import type { JSX } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { FormField } from "@/components/common/form-field";
import { JobPostingRow } from "@/components/jobs/job-posting-row";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { PaginationBar } from "@/components/ui/table/pagination-bar";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { AuthActor } from "@/enums/auth-actor.enum";
import { OverlayKind } from "@/enums/overlay-kind.enum";
import { useBranchOptions } from "@/hooks/branches/use-branch-options";
import { useI18n } from "@/hooks/core/use-i18n";
import { useJobPostings } from "@/hooks/jobs/use-job-postings";
import { useOverlay } from "@/hooks/core/use-overlay";
import { useAuthStore } from "@/store/auth.store";

const FIRST_PAGE = 1;

/** Vacancies and their applications: for a branch manager and for a brand owner (who picks a branch). */
export function JobsScreen({ actor }: { actor: AuthActor }): JSX.Element {
  const { dictionary } = useI18n();
  const { jobs: t } = dictionary;
  if (actor !== AuthActor.Manager && actor !== AuthActor.Owner) {
    return <EmptyState variant="forbidden" title={t.states.forbiddenTitle} body={t.states.forbiddenBody} />;
  }
  return <JobsContent />;
}

function JobsContent(): JSX.Element {
  const { dictionary } = useI18n();
  const { jobs: t } = dictionary;
  const ownBranchId = useAuthStore((state) => state.profile?.branch_id ?? null);
  const branchOptions = useBranchOptions(ownBranchId === null);
  const branches = branchOptions.data ?? [];
  const [picked, setPicked] = useState<string>();
  const branchId = ownBranchId ?? picked ?? branches[0]?.id ?? null;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-heading text-3xl font-semibold">{t.title}</h1>
      {ownBranchId === null && branches.length > 1 ? (
        <FormField id="jobs-branch" label={t.branch}>
          <NativeSelect id="jobs-branch" value={branchId ?? ""} onChange={(event) => setPicked(event.target.value)}>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </NativeSelect>
        </FormField>
      ) : null}
      {branchId === null ? <EmptyState title={t.states.noBranchTitle} body={t.states.noBranchBody} /> : <PostingsList branchId={branchId} />}
    </div>
  );
}

function PostingsList({ branchId }: { branchId: string }): JSX.Element {
  const { dictionary } = useI18n();
  const { jobs: t } = dictionary;
  const overlay = useOverlay();
  const [page, setPage] = useState(FIRST_PAGE);
  const query = useJobPostings(branchId, page);
  const items = query.data?.items ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button type="button" onClick={() => overlay.open({ kind: OverlayKind.JobPostingForm, branchId })}>
          <PlusIcon aria-hidden data-icon="inline-start" />
          {t.newPosting}
        </Button>
      </div>
      <div aria-busy={query.isFetching} className="flex flex-col gap-4">
        {query.isPending ? <TableSkeleton /> : null}
        {query.isError ? <ErrorState title={t.states.errorTitle} body={t.states.errorBody} onRetry={() => query.refetch()} /> : null}
        {query.data && items.length === 0 ? <EmptyState title={t.states.emptyTitle} body={t.states.emptyBody} /> : null}
        {items.length > 0 ? (
          <>
            <ul aria-label={t.title} className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {items.map((posting) => (
                <JobPostingRow
                  key={posting.id}
                  posting={posting}
                  onApplications={(value) => overlay.open({ kind: OverlayKind.JobApplications, branchId, posting: value })}
                  onEdit={(value) => overlay.open({ kind: OverlayKind.JobPostingForm, branchId, posting: value })}
                />
              ))}
            </ul>
            {query.data ? <PaginationBar page={query.data.page.current_page} totalPages={query.data.page.total_pages} label={t.title} onPageChange={setPage} /> : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
