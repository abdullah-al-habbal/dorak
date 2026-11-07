"use client";

import { PlusIcon } from "lucide-react";
import { useCallback } from "react";
import type { JSX } from "react";

import { AdminSubscriptionList } from "@/components/admin-subscriptions/admin-subscription-list";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { PaginationBar } from "@/components/ui/table/pagination-bar";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { AuthActor } from "@/enums/auth-actor.enum";
import { OverlayKind } from "@/enums/overlay-kind.enum";
import { SubscriptionStatus } from "@/enums/subscription-status.enum";
import { useAdminSubscriptionFilters } from "@/hooks/use-admin-subscription-filters";
import { useAdminSubscriptions } from "@/hooks/use-admin-subscriptions";
import { useI18n } from "@/hooks/use-i18n";
import { useOverlay } from "@/hooks/use-overlay";
import { useUpdateSubscriptionStatus } from "@/hooks/use-update-subscription-status";
import { localizedText } from "@/lib/booking-format.util";
import type { AdminSubscription } from "@/types/admin-subscription.type";
import type { SubscriptionTarget } from "@/types/subscription-target.type";

/** Brand subscriptions are platform-admin only; the proxy and the backend refuse everyone else too. */
export function AdminSubscriptionsScreen({ actor }: { actor: AuthActor }): JSX.Element {
  const { dictionary } = useI18n();
  if (actor !== AuthActor.Admin) {
    const { states } = dictionary.adminSubscriptions;
    return <EmptyState variant="forbidden" title={states.forbiddenTitle} body={states.forbiddenBody} />;
  }
  return <AdminSubscriptionsContent />;
}

function AdminSubscriptionsContent(): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { adminSubscriptions: t, subscription } = dictionary;
  const { filters, update } = useAdminSubscriptionFilters();
  const overlay = useOverlay();
  const updateStatus = useUpdateSubscriptionStatus();
  const query = useAdminSubscriptions(filters);
  const clear = useCallback(() => update({ status: undefined }), [update]);
  const changePage = useCallback((page: number) => update({ page }), [update]);
  const openAssign = useCallback(() => overlay.open({ kind: OverlayKind.AssignSubscription }), [overlay]);
  const confirmTransition = useCallback(
    (item: AdminSubscription, target: SubscriptionTarget) => {
      const copy = t.confirm[target];
      overlay.open({
        kind: OverlayKind.Confirm,
        title: copy.title,
        description: `${localizedText(item.brand?.name, locale)}: ${copy.body}`,
        confirmLabel: copy.confirm,
        destructive: target === SubscriptionStatus.Cancelled,
        onConfirm: async () => {
          await updateStatus.mutateAsync({ id: item.id, status: target });
        },
      });
    },
    [locale, overlay, t, updateStatus],
  );
  const items = query.data?.items ?? [];
  const page = query.data?.page;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold">{t.title}</h1>
        <p className="max-w-prose text-sm text-muted-foreground">{t.description}</p>
      </div>

      <div role="group" aria-label={t.filters.toolbar} className="flex flex-wrap items-center gap-2">
        <label className="w-full sm:w-52">
          <span className="sr-only">{t.filters.status}</span>
          <NativeSelect value={filters.status ?? ""} onChange={(event) => update({ status: Object.values(SubscriptionStatus).find((status) => status === event.target.value) })}>
            <option value="">{t.filters.allStatuses}</option>
            {Object.values(SubscriptionStatus).map((status) => (
              <option key={status} value={status}>{subscription.status[status]}</option>
            ))}
          </NativeSelect>
        </label>
        <Button className="ms-auto" onClick={openAssign}>
          <PlusIcon aria-hidden data-icon="inline-start" />
          {t.assign}
        </Button>
      </div>

      <div aria-busy={query.isFetching} className="flex flex-col gap-4">
        {query.isPending ? <TableSkeleton /> : null}
        {query.isError && items.length === 0 ? <ErrorState title={t.states.errorTitle} body={t.states.errorBody} onRetry={() => query.refetch()} /> : null}
        {query.data && items.length === 0 ? (
          filters.status ? (
            <EmptyState variant="filtered" title={t.states.filteredTitle} body={t.states.filteredBody} onClear={clear} clearLabel={t.filters.clear} />
          ) : (
            <EmptyState title={t.states.emptyTitle} body={t.states.emptyBody} />
          )
        ) : null}
        {items.length > 0 ? (
          <>
            <p className="tabular text-sm text-muted-foreground" aria-live="polite">{t.states.results.replace("{count}", String(page?.total ?? items.length))}</p>
            <AdminSubscriptionList subscriptions={items} onTransition={confirmTransition} />
            {page ? <PaginationBar page={page.current_page} totalPages={page.total_pages} label={t.title} onPageChange={changePage} /> : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
