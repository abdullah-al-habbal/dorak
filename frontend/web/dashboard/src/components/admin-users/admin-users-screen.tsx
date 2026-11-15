"use client";

import { UserPlusIcon } from "lucide-react";
import type { JSX } from "react";

import { AdminUserList } from "@/components/admin-users/admin-user-list";
import { AdminUserToolbar } from "@/components/admin-users/admin-user-toolbar";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";
import { PaginationBar } from "@/components/ui/table/pagination-bar";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { DEFAULT_ADMIN_USER_STATE } from "@/config/admin-user.constant";
import { AuthActor } from "@/enums/auth-actor.enum";
import { OverlayKind } from "@/enums/overlay-kind.enum";
import { useAccountProfile } from "@/hooks/use-account-profile";
import { useAdminUserFilters } from "@/hooks/use-admin-user-filters";
import { useAdminUsers } from "@/hooks/use-admin-users";
import { useConfirmAdminUserActive } from "@/hooks/use-confirm-admin-user-active";
import { useI18n } from "@/hooks/use-i18n";
import { useOverlay } from "@/hooks/use-overlay";
import { useResendAdminInvite } from "@/hooks/use-resend-admin-invite";
import { hasAdminUserFilters } from "@/lib/admin-user-filters.util";
import type { AdminUser } from "@/types/platform/admin-user.type";

/** Managing admin accounts is platform-admin only; the proxy and the backend refuse everyone else too. */
export function AdminUsersScreen({ actor }: { actor: AuthActor }): JSX.Element {
  const { dictionary } = useI18n();
  if (actor !== AuthActor.Admin) {
    const { states } = dictionary.adminUsers;
    return <EmptyState variant="forbidden" title={states.forbiddenTitle} body={states.forbiddenBody} />;
  }
  return <AdminUsersContent />;
}

function AdminUsersContent(): JSX.Element {
  const { dictionary } = useI18n();
  const { adminUsers: t } = dictionary;
  const { filters, update } = useAdminUserFilters();
  const overlay = useOverlay();
  const profile = useAccountProfile();
  const confirmActive = useConfirmAdminUserActive();
  const { mutate: resend } = useResendAdminInvite();
  const query = useAdminUsers(filters);
  const clear = () => update({ state: DEFAULT_ADMIN_USER_STATE, search: undefined });
  const items = query.data?.items ?? [];
  const page = query.data?.page;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-3xl font-semibold">{t.title}</h1>
          <p className="max-w-prose text-sm text-muted-foreground">{t.description}</p>
        </div>
        <Button onClick={() => overlay.open({ kind: OverlayKind.AdminUserForm })}>
          <UserPlusIcon aria-hidden data-icon="inline-start" />
          {t.invite}
        </Button>
      </div>

      <AdminUserToolbar filters={filters} onChange={update} />

      <div aria-busy={query.isFetching} className="flex flex-col gap-4">
        {query.isPending ? <TableSkeleton /> : null}
        {query.isError && items.length === 0 ? <ErrorState title={t.states.errorTitle} body={t.states.errorBody} onRetry={() => query.refetch()} /> : null}
        {query.data && items.length === 0 ? (
          hasAdminUserFilters(filters) ? (
            <EmptyState variant="filtered" title={t.states.filteredTitle} body={t.states.filteredBody} onClear={clear} clearLabel={t.filters.clear} />
          ) : (
            <EmptyState title={t.states.emptyTitle} body={t.states.emptyBody} />
          )
        ) : null}
        {items.length > 0 ? (
          <>
            <p className="tabular text-sm text-muted-foreground" aria-live="polite">{t.states.results.replace("{count}", String(page?.total ?? items.length))}</p>
            <AdminUserList
              admins={items}
              currentEmail={profile.data?.email ?? undefined}
              onEdit={(admin: AdminUser) => overlay.open({ kind: OverlayKind.AdminUserForm, admin })}
              onToggleActive={confirmActive}
              onResendInvite={(admin: AdminUser) => resend(admin.id)}
            />
            {page ? <PaginationBar page={page.current_page} totalPages={page.total_pages} label={t.title} onPageChange={(next) => update({ page: next })} /> : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
