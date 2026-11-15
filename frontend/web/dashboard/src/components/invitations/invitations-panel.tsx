"use client";

import { UserPlusIcon } from "lucide-react";
import { useState } from "react";
import type { JSX } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { FormField } from "@/components/common/form-field";
import { InvitationRow } from "@/components/invitations/invitation-row";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { PaginationBar } from "@/components/ui/table/pagination-bar";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { INVITATION_FILTER_ALL, INVITATION_STATUSES } from "@/config/invitation.constant";
import { OverlayKind } from "@/enums/overlay-kind.enum";
import { useActOnInvitation } from "@/hooks/branches/use-act-on-invitation";
import { useI18n } from "@/hooks/core/use-i18n";
import { useInvitations } from "@/hooks/branches/use-invitations";
import { useOverlay } from "@/hooks/core/use-overlay";
import type { InvitationAction } from "@/services/api/mutation/branches/invitation.mutation";
import type { BranchInvitation } from "@/types/branches/branch-invitation.type";

const FIRST_PAGE = 1;

interface InvitationsPanelProps {
  branchId: string | null;
  readOnly: boolean;
}

/** The branch's barber invitations: pending requests to answer, active affiliations to end, and the history. */
export function InvitationsPanel({ branchId, readOnly }: InvitationsPanelProps): JSX.Element {
  const { dictionary } = useI18n();
  const { invitations: t } = dictionary;
  if (branchId === null) return <EmptyState title={t.states.noBranchTitle} body={t.states.noBranchBody} />;
  return <InvitationsList branchId={branchId} readOnly={readOnly} heading={t.title} />;
}

function InvitationsList({ branchId, readOnly, heading }: { branchId: string; readOnly: boolean; heading: string }): JSX.Element {
  const { dictionary } = useI18n();
  const { invitations: t } = dictionary;
  const overlay = useOverlay();
  const act = useActOnInvitation();
  const [status, setStatus] = useState<string>(INVITATION_FILTER_ALL);
  const [page, setPage] = useState(FIRST_PAGE);
  const query = useInvitations(branchId, status, page);
  const items = query.data?.items ?? [];

  function changeStatus(value: string): void {
    setStatus(value);
    setPage(FIRST_PAGE);
  }

  function handle(invitation: BranchInvitation, action: InvitationAction): void {
    if (action !== "terminate") {
      act.mutate({ branchId, id: invitation.id, action });
      return;
    }
    overlay.open({
      kind: OverlayKind.Confirm,
      title: t.confirm.terminateTitle,
      description: t.confirm.terminateBody,
      confirmLabel: t.action.terminate,
      destructive: true,
      onConfirm: async () => {
        await act.mutateAsync({ branchId, id: invitation.id, action });
      },
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <FormField id="invitation-status" label={t.filter}>
          <NativeSelect id="invitation-status" value={status} onChange={(event) => changeStatus(event.target.value)}>
            <option value={INVITATION_FILTER_ALL}>{t.allStatuses}</option>
            {INVITATION_STATUSES.map((value) => (
              <option key={value} value={value}>{t.status[value]}</option>
            ))}
          </NativeSelect>
        </FormField>
        {readOnly ? null : (
          <Button type="button" onClick={() => overlay.open({ kind: OverlayKind.InviteBarber, branchId })}>
            <UserPlusIcon aria-hidden data-icon="inline-start" />
            {t.invite}
          </Button>
        )}
      </div>
      <div aria-busy={query.isFetching} className="flex flex-col gap-4">
        {query.isPending ? <TableSkeleton /> : null}
        {query.isError ? <ErrorState title={t.states.errorTitle} body={t.states.errorBody} onRetry={() => query.refetch()} /> : null}
        {query.data && items.length === 0 ? <EmptyState title={t.states.emptyTitle} body={t.states.emptyBody} /> : null}
        {items.length > 0 ? (
          <>
            <ul aria-label={heading} className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {items.map((invitation) => (
                <InvitationRow key={invitation.id} invitation={invitation} readOnly={readOnly} busy={act.isPending} onAct={handle} />
              ))}
            </ul>
            {query.data ? <PaginationBar page={query.data.page.current_page} totalPages={query.data.page.total_pages} label={heading} onPageChange={setPage} /> : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
