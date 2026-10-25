import type {
  IBackendNotification,
  INotificationInbox,
  INotificationItem,
  INotificationReadAll,
} from "@/services/api/common/notification-inbox/types/notification-inbox.types";

function numberOr(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function mapNotification(raw: IBackendNotification): INotificationItem {
  return {
    id: raw.id,
    type: raw.type,
    title: raw.title,
    body: raw.body,
    data: raw.data ?? {},
    readAt: raw.read_at,
    createdAt: raw.created_at,
  };
}

/** Folds the backend list envelope (`data` + `meta.pagination` + `meta.unread_count`) into one BFF payload. */
export function mapNotificationInbox(
  data: unknown,
  meta: Record<string, unknown> | undefined,
): INotificationInbox {
  const items = Array.isArray(data)
    ? (data as IBackendNotification[]).map(mapNotification)
    : [];
  const pagination = meta?.pagination as Record<string, unknown> | undefined;
  return {
    items,
    unreadCount: numberOr(
      meta?.unread_count,
      items.filter((item) => !item.readAt).length,
    ),
    total: numberOr(pagination?.total, items.length),
  };
}

export function mapNotificationReadAll(data: unknown): INotificationReadAll {
  const raw = (data ?? {}) as Record<string, unknown>;
  return {
    updated: numberOr(raw.updated, 0),
    unreadCount: numberOr(raw.unread_count, 0),
  };
}

export function decrementUnread(
  inbox: INotificationInbox,
  id: string,
  readAt: string,
): INotificationInbox {
  const target = inbox.items.find((item) => item.id === id);
  if (!target || target.readAt) return inbox;
  return {
    ...inbox,
    unreadCount: Math.max(0, inbox.unreadCount - 1),
    items: inbox.items.map((item) =>
      item.id === id ? { ...item, readAt } : item,
    ),
  };
}
