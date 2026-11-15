"use client";

import type { JSX } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { NotificationItem } from "@/components/layout/notifications/notification-item";
import { Button } from "@/components/ui/button";
import { PaginationBar } from "@/components/ui/table/pagination-bar";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import type { AuthActor } from "@/enums/access/auth-actor.enum";
import { useMarkAllNotificationsRead, useMarkNotificationRead } from "@/hooks/account/notifications/use-mark-notification-read";
import { useNotificationFilters } from "@/hooks/account/notifications/use-notification-filters";
import { useNotificationPage } from "@/hooks/account/notifications/use-notification-page";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { hasNotificationFilters } from "@/lib/account/notification-filters.util";
import { notificationHref } from "@/lib/account/notification-link.util";
import type { DashboardNotification } from "@/types/account/profile/dashboard-notification.type";

/** FT-5: the whole inbox with paging; the bell only shows the latest 20. */
export function NotificationsScreen({ actor }: { actor: AuthActor }): JSX.Element {
  const { dictionary } = useI18n();
  const shell = dictionary.shell.notifications;
  const t = dictionary.notificationsPage;
  const { filters, update } = useNotificationFilters();
  const query = useNotificationPage(filters);
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const items = query.data?.items ?? [];
  const page = query.data?.page;
  const unread = query.data?.unreadCount ?? 0;

  function openItem(notification: DashboardNotification): void {
    if (!notification.read_at) markRead.mutate(notification.id);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold">{shell.title}</h1>
        <p className="max-w-prose text-sm text-muted-foreground">{t.description}</p>
      </div>

      <div role="group" aria-label={t.toolbar} className="flex flex-wrap items-center gap-2">
        <Button variant={filters.unreadOnly ? "outline" : "secondary"} aria-pressed={!filters.unreadOnly} onClick={() => update({ unreadOnly: false })}>{t.all}</Button>
        <Button variant={filters.unreadOnly ? "secondary" : "outline"} aria-pressed={filters.unreadOnly} onClick={() => update({ unreadOnly: true })}>
          {t.unreadOnly.replace("{count}", String(unread))}
        </Button>
        <Button className="ms-auto" variant="ghost" disabled={unread === 0 || markAll.isPending} onClick={() => markAll.mutate()}>{shell.markAll}</Button>
      </div>

      <div aria-busy={query.isFetching} className="flex flex-col gap-4">
        {query.isPending ? <TableSkeleton /> : null}
        {query.isError && items.length === 0 ? <ErrorState title={t.errorTitle} body={shell.error} onRetry={() => query.refetch()} /> : null}
        {query.data && items.length === 0 ? (
          hasNotificationFilters(filters) ? (
            <EmptyState variant="filtered" title={t.filteredTitle} body={t.filteredBody} onClear={() => update({ unreadOnly: false })} clearLabel={t.all} />
          ) : (
            <EmptyState title={shell.empty} body={shell.emptyHint} />
          )
        ) : null}
        {items.length > 0 ? (
          <>
            <p className="tabular text-sm text-muted-foreground" aria-live="polite">{t.results.replace("{count}", String(page?.total ?? items.length))}</p>
            <ul className="divide-y rounded-lg border bg-card">
              {items.map((notification) => (
                <li key={notification.id}>
                  <NotificationItem notification={notification} href={notificationHref(notification, actor)} onOpen={openItem} />
                </li>
              ))}
            </ul>
            {page ? <PaginationBar page={page.current_page} totalPages={page.total_pages} label={shell.title} onPageChange={(next) => update({ page: next })} /> : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
