"use client";

import { BellIcon } from "lucide-react";
import { useState } from "react";
import type { JSX } from "react";

import { NotificationItem } from "@/components/layout/notification-item";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NOTIFICATION_BADGE_MAX } from "@/config/notification.constant";
import type { AuthActor } from "@/enums/auth-actor.enum";
import { useI18n } from "@/hooks/use-i18n";
import { useMarkAllNotificationsRead, useMarkNotificationRead } from "@/hooks/use-mark-notification-read";
import { useNotificationFeed } from "@/hooks/use-notification-feed";
import { notificationHref } from "@/lib/notification-link.util";
import type { DashboardNotification } from "@/types/account/dashboard-notification.type";

/** The bell: an unread badge that polls every minute, the latest rows, mark-as-read and mark-all (NS-10). */
export function NotificationsMenu({ actor }: { actor: AuthActor }): JSX.Element {
  const { dictionary } = useI18n();
  const { notifications: t } = dictionary.shell;
  const [open, setOpen] = useState(false);
  const feed = useNotificationFeed();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const unread = feed.data?.unreadCount ?? 0;
  const items = feed.data?.items ?? [];
  const badge = unread > NOTIFICATION_BADGE_MAX ? `${NOTIFICATION_BADGE_MAX}+` : String(unread);

  function openItem(notification: DashboardNotification): void {
    if (!notification.read_at) markRead.mutate(notification.id);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button variant="ghost" size="icon" className="relative" aria-label={unread > 0 ? t.titleWithCount.replace("{count}", String(unread)) : t.title} />}>
        <BellIcon aria-hidden />
        {unread > 0 ? (
          <span className="tabular absolute end-1 top-1 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-medium leading-4 text-primary-foreground" aria-hidden>
            {badge}
          </span>
        ) : null}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 gap-0 p-0">
        <div className="flex items-center justify-between gap-2 border-b px-4 py-2">
          <span className="text-sm font-medium">{t.title}</span>
          <Button size="sm" variant="ghost" disabled={unread === 0 || markAll.isPending} onClick={() => markAll.mutate()}>
            {t.markAll}
          </Button>
        </div>
        {feed.isError ? <p role="alert" className="px-4 py-6 text-sm text-destructive">{t.error}</p> : null}
        {feed.data && items.length === 0 ? (
          <div className="flex flex-col items-center gap-1 px-6 py-10 text-center">
            <span className="mb-2 grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">
              <BellIcon className="size-5" aria-hidden />
            </span>
            <p className="text-sm font-medium">{t.empty}</p>
            <p className="text-sm text-muted-foreground">{t.emptyHint}</p>
          </div>
        ) : null}
        <ul className="max-h-96 divide-y overflow-y-auto overscroll-contain">
          {items.map((notification) => (
            <li key={notification.id}>
              <NotificationItem notification={notification} href={notificationHref(notification, actor)} onOpen={openItem} />
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
