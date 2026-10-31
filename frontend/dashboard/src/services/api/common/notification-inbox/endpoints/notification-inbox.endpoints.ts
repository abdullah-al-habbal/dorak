const NOTIFICATION_INBOX_API_BASE_PATH = "/notifications";

export const NotificationInboxEndpoints = {
  inbox: NOTIFICATION_INBOX_API_BASE_PATH,
  markRead: (id: string) =>
    `${NOTIFICATION_INBOX_API_BASE_PATH}/${encodeURIComponent(id)}/read`,
  markAllRead: `${NOTIFICATION_INBOX_API_BASE_PATH}/read-all`,
} as const;
