"use client";

import { HEADER_CONTROL_CLASS_NAME } from "@/components/common/header/header-control.constant";
import { NotificationBellItem } from "@/components/portal/notification-bell-item";
import { Badge } from "@/components/tailgrids/core/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuHeader,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/tailgrids/core/dropdown";
import { useDictionary } from "@/hooks/use-dictionary";
import { useMarkAllNotificationsReadMutation } from "@/hooks/use-mark-all-notifications-read-mutation";
import { useMarkNotificationReadMutation } from "@/hooks/use-mark-notification-read-mutation";
import { useNotificationInboxQuery } from "@/hooks/use-notification-inbox-query";
import { useSession } from "@/hooks/use-session";
import { notificationHref } from "@/services/api/notification-link.util";
import { cn } from "@/utils/cn.util";
import { Bell1 } from "@tailgrids/icons";
import { useRouter } from "next/navigation";

/** Admin sessions authenticate as admin_api, which has no notification inbox. */
export function NotificationBell() {
  const session = useSession();
  const router = useRouter();
  const isEnabled = session.actor !== "admin";
  const copy = useDictionary().common.notifications;
  const inbox = useNotificationInboxQuery(isEnabled);
  const markRead = useMarkNotificationReadMutation();
  const markAllRead = useMarkAllNotificationsReadMutation();
  if (!isEnabled) return null;

  const items = inbox.data?.items ?? [];
  const unreadCount = inbox.data?.unreadCount ?? 0;
  const label = copy.unreadLabel.replace("{count}", String(unreadCount));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={label}
        className={cn(
          HEADER_CONTROL_CLASS_NAME,
          "relative flex items-center justify-center",
        )}
      >
        <Bell1 aria-hidden="true" />
        {unreadCount > 0 ? (
          <Badge
            size="sm"
            color="error"
            data-testid="notification-unread-count"
            className="absolute -end-1.5 -top-1.5 min-w-5 justify-center px-1"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        placement="bottom end"
        className="max-h-96 w-80 overflow-y-auto"
      >
        <DropdownMenuHeader>
          <p className="font-medium text-text-primary">{copy.title}</p>
        </DropdownMenuHeader>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <DropdownMenuItem isDisabled>{copy.empty}</DropdownMenuItem>
        ) : (
          items.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              textValue={notification.title}
              onAction={() => {
                if (!notification.readAt) markRead.mutate(notification.id);
                const href = notificationHref(notification, session.actor);
                if (href) router.push(href);
              }}
            >
              <NotificationBellItem
                notification={notification}
                unreadLabel={copy.unread}
              />
            </DropdownMenuItem>
          ))
        )}
        {unreadCount > 0 ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onAction={() => markAllRead.mutate()}>
              {copy.markAllRead}
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
