"use client";

import type { NotificationBellItemProps } from "@/components/portal/notification-bell.types";

export function NotificationBellItem({
  notification,
  unreadLabel,
}: NotificationBellItemProps) {
  const isUnread = !notification.readAt;
  return (
    <span className="flex min-w-0 flex-1 items-start gap-2 py-1">
      <span
        aria-hidden="true"
        className={
          isUnread
            ? "mt-1.5 size-2 shrink-0 rounded-full bg-primary-500"
            : "mt-1.5 size-2 shrink-0"
        }
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-text-primary">
          {notification.title}
        </span>
        <span className="block truncate text-xs text-text-tertiary">
          {notification.body}
        </span>
        {isUnread ? <span className="sr-only">{unreadLabel}</span> : null}
      </span>
    </span>
  );
}
