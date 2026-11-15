"use client";

import Link from "next/link";
import type { JSX } from "react";

import { useI18n } from "@/hooks/core/use-i18n";
import { cn } from "@/lib/utils";
import { notificationEvent } from "@/lib/notification-link.util";
import type { DashboardNotification } from "@/types/account/dashboard-notification.type";

interface NotificationItemProps {
  notification: DashboardNotification;
  href: string | undefined;
  onOpen: (notification: DashboardNotification) => void;
}

/** One inbox row. The text comes from the event key in the user's language; the stored English is the fallback. */
export function NotificationItem({ notification, href, onOpen }: NotificationItemProps): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { notifications: t } = dictionary.shell;
  const event = notificationEvent(notification);
  const copy = event === undefined ? undefined : t.events[event];
  const unread = !notification.read_at;
  const when = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(notification.created_at));

  const content = (
    <>
      <span className="flex items-center gap-2">
        {unread ? <span className="size-2 shrink-0 rounded-full bg-primary" aria-hidden /> : null}
        <span className={cn("text-sm", unread ? "font-medium" : "text-muted-foreground")} dir="auto">{copy?.title ?? notification.title}</span>
        {unread ? <span className="sr-only">{t.unread}</span> : null}
      </span>
      <span className="text-sm text-muted-foreground" dir="auto">{copy?.body ?? notification.body}</span>
      <span className="tabular text-xs text-muted-foreground">{when}</span>
    </>
  );
  const classes = "flex w-full flex-col gap-0.5 px-4 py-3 text-start hover:bg-muted/50 focus-visible:bg-muted/60 focus-visible:outline-none";

  return href ? (
    <Link href={href} className={classes} onClick={() => onOpen(notification)}>
      {content}
    </Link>
  ) : (
    <button type="button" className={classes} onClick={() => onOpen(notification)}>
      {content}
    </button>
  );
}
